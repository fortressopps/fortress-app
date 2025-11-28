import express from "express";
import compression from "compression";
import helmet from "helmet";
import cors from "cors";
import { bootstrapApp } from "./core/bootstrap/app.bootstrap.js";
import { ENV } from "./config/env/env.loader.js";

const app = express();
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "2mb" }));
app.use(cors({ origin: true, credentials: true }));

await bootstrapApp(app);

const port = ENV.PORT || 4000;
app.listen(port, () => console.log(`Fortress v7.21 listening on :${port}`));
