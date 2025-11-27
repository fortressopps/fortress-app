import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { getAuth } from "@clerk/express";
// ==== Fortress Core Modules ====
import routes from "./routes";
import { clerkWebhookHandler } from "./webhooks/clerkWebhook";
import { stripeWebhookHandler } from "./webhooks/stripeWebhook";
import { fortressLogger } from "./utils/logger";
import { fortressUUID } from "./utils/uuid";
import { gracefulShutdown } from "./utils/gracefulShutdown";
// ======================
//  AUTH MIDDLEWARE
// ======================
const requireAuth = (req, res, next) => {
    const { userId } = getAuth(req);
    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Não autorizado — autenticação necessária",
        });
    }
    req.auth = { userId };
    next();
};
// ======================
//  RATE LIMIT (dynamic)
// ======================
const getRateLimitValue = () => process.env.NODE_ENV === "production" ? 200 : 2000;
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: getRateLimitValue(),
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Limite de requisições excedido. Tente novamente em 15 minutos.",
    },
});
// ======================
//  INIT EXPRESS APP
// ======================
const app = express();
// ======================
//  SECURITY MIDDLEWARES
// ======================
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://js.clerk.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:", "https://img.clerk.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            connectSrc: ["'self'", "https://api.clerk.com", "https://api.stripe.com"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));
// ======================
//  CORS CONFIG
// ======================
const origins = process.env.CLIENT_URL?.split(",") ?? [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
];
app.use(cors({
    origin: origins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
}));
// ======================
// RAW BODY (WEBHOOKS)
// ======================
app.use(express.json({
    limit: "20mb",
    verify: (req, res, buf) => {
        req.rawBody = buf;
    },
}));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(compression());
// ======================
// LOGGING (DEV ONLY)
// ======================
if (process.env.NODE_ENV === "development") {
    app.use(morgan("tiny"));
}
// ======================
// REQUEST METADATA
// ======================
app.use((req, res, next) => {
    req.requestId = fortressUUID();
    req.requestTime = new Date().toISOString();
    fortressLogger.info({
        event: "REQUEST_RECEIVED",
        id: req.requestId,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
    });
    next();
});
// ======================
// RATE LIMIT (API ONLY)
// ======================
app.use("/api", apiLimiter);
// ======================
// HEALTH CHECK ENDPOINT
// ======================
app.get("/health", (req, res) => {
    res.status(200).json({
        service: "Fortress API",
        status: "online",
        environment: process.env.NODE_ENV || "development",
        uptime: process.uptime(),
        timestamp: req.requestTime,
        requestId: req.requestId,
        memory: {
            heap: process.memoryUsage().heapUsed,
            rss: process.memoryUsage().rss,
        },
        node: process.version,
    });
});
// ======================
// ROOT DOCUMENTATION
// ======================
app.get("/", (req, res) => {
    res.json({
        app: "Fortress API — Sistema Militarizado de Gestão Financeira",
        version: "2.0-enterprise",
        timestamp: req.requestTime,
        requestId: req.requestId,
        modules: [
            "auth",
            "accounts",
            "transactions",
            "analytics",
            "budget",
            "supermarket",
            "user",
            "privacy",
            "bills",
            "investments",
            "battle",
        ],
        docs: "https://github.com/fortressopps/fortress-app",
    });
});
// ======================
// API ROUTES (AUTO-LOADED)
// ======================
app.use("/api", routes);
// ======================
// WEBHOOKS
// ======================
app.post("/webhooks/clerk", express.raw({ type: "application/json" }), clerkWebhookHandler);
app.post("/webhooks/stripe", express.raw({ type: "application/json" }), stripeWebhookHandler);
// ======================
// NOT FOUND HANDLER
// ======================
app.all("*", (req, res) => {
    res.status(404).json({
        status: "error",
        message: `Rota ${req.originalUrl} não encontrada`,
        requestId: req.requestId,
    });
});
// ======================
// GLOBAL ERROR HANDLER
// ======================
app.use((err, req, res, _next) => {
    fortressLogger.error({
        event: "ERROR",
        id: req.requestId,
        url: req.originalUrl,
        message: err.message,
        stack: err.stack,
    });
    res.status(err.statusCode || 500).json({
        status: "error",
        message: err.message || "Erro interno",
        requestId: req.requestId,
    });
});
// ======================
// SERVER STARTUP
// ======================
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
    console.log("\n" + "═".repeat(80));
    console.log("🏰  FORTRESS BACKEND ENTERPRISE - INICIADO");
    console.log("═".repeat(80));
    console.log(`📍 Porta: ${PORT}`);
    console.log(`🌎 Ambiente: ${process.env.NODE_ENV}`);
    console.log(`🗄️ Database: Prisma + PostgreSQL`);
    console.log(`🔐 Auth: Clerk`);
    console.log("═".repeat(80));
});
// ======================
// GRACEFUL SHUTDOWN
// ======================
gracefulShutdown(server);
export default app;
