import { initAWS } from "@src/infrastructure/aws";
import { ApiServer } from "@src/presentation/api-server";

initAWS();
const server = new ApiServer();
server.start();
