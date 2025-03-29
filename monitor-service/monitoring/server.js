import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();




const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROTO_PATH = __dirname + '/../../proto/monitor.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const monitorProto = grpc.loadPackageDefinition(packageDefinition).monitor;


async function checkWebsite(call, callback) {
    const { url } = call.request;
    try {
        const startTime = Date.now();
        const response = await axios.get(url, { timeout: 5000 }); 
        const responseTime = Date.now() - startTime;

        callback(null, { url, status: "UP", responseTime });
    } catch (error) {
        callback(null, { url, status: "DOWN", responseTime: 0 });
    }
}


function startServer() {
    const server = new grpc.Server();
    server.addService(monitorProto.MonitorService.service, { CheckWebsite: checkWebsite });

    const PORT = process.env.GRPC_PORT || "50051";
    server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), () => {
        console.log(` gRPC Server running on port ${PORT}`);
    });
}

startServer();
