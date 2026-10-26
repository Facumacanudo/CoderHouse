import path from "node:path";
import { fileURLToPath } from "node:url";
import ServicesManager from "./managers/ServiceManager.js";
import "./config/env.config.js";

const DATABASE_NAME = "services.json";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const databasePath = path.join(__dirname, "data", DATABASE_NAME);

const manager = new ServicesManager(databasePath);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Anima los puntos: "Cargando", "Cargando.", "Cargando..", "Cargando..." (x2)
for (let i = 0; i < 8; i++) {
    process.stdout.write(`\rCargando ServiceManager${".".repeat(i % 4)}   `);
    await sleep(200);
}

const services = await manager.getServices();
console.log("\rCargando ServiceManager... Ok   ");
console.log(`Servicios cargados: ${services.length}`);
console.log(services);

