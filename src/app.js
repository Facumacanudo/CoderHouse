import path from "node:path";
import { fileURLToPath } from "node:url";
import ServicesManager from "./managers/ServiceManager.js";
import "./config/env.config.js";

const DATABASE_NAME = "services.json";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const databasePath = path.join(__dirname, "data", DATABASE_NAME);

const manager = new ServicesManager(databasePath);




console.log("All services:", await manager.getServices());