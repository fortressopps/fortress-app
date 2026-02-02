// App Hono exportado para testes (sem subir servidor)
import { Hono } from "hono";
import { bootstrap } from "./server/bootstrap";

const app = new Hono();
await bootstrap(app);
export { app };
