import http from "http";
import app from "./index";
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
const server = http.createServer(app);
server.listen(PORT, () => {
    console.log("[FORTRESS ENTERPRISE] Server TS rodando na porta " + PORT);
});
export default server;
