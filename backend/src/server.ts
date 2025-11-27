import http from "http";
import app from "./index";
import { gracefulShutdown } from "./utils/gracefulShutdown";

// ======================
// SERVER CONFIG
// ======================
const PORT: number = process.env.PORT ? Number(process.env.PORT) : 3001;

// ======================
// CREATE HTTP SERVER
// ======================
const server = http.createServer(app);

// ======================
// STARTUP LOGS
// ======================
server.listen(PORT, () => {
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

export default server;