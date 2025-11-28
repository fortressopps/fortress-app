// src/main.server.ts
import express from "express";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";

import { loadEnv } from "./core/env.loader.js";
import { bootstrapApp } from "./core/app.bootstrap.js";
import { globalErrorHandler } from "./core/error.handler.js";

loadEnv(); // Carrega .env com segurança

const app = express();

// Middlewares globais
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Inicializa módulos e rotas
bootstrapApp(app);

// Handler global de erros
app.use(globalErrorHandler);

// Inicia servidor
const PORT = process.env.PORT ?? 3001;

app.listen(PORT, () => {
  console.log(`🔥 Fortress v7.20 backend ON → port ${PORT}`);
});
