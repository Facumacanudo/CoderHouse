import path from "node:path";
import { fileURLToPath } from "node:url";
import ServicesManager from "./managers/ServiceManager.js";

const DATABASE_NAME = "services.json";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const databasePath = path.join(__dirname, "data", DATABASE_NAME);

const manager = new ServicesManager(databasePath);

//console.log({ services: await manager.getServices() });
//console.log(await manager.getServiceById(4));

const newService = {
    id: 4,
    name: "Corte de pelo de paredes",
    description: "Corte de pelo de paredes",
    price: 1000,
    duration: 30,
    category: "Corte de pelo",
    available: true
};

