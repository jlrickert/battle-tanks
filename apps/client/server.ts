import * as path from "path";
import * as url from "url";
import { getGlobalWebSocketServer } from "./src/lib/server/websockets/webSocketServer";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const wss = getGlobalWebSocketServer();

const { server } = await import(path.resolve(__dirname, "./build/index.js"));
server.server.on("upgrade", wss.onHttpServerUpgrade);
