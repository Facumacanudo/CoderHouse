import { writeFile, readFile } from "node:fs/promises";
 
// Campos que forman un servicio (sin el id, que lo genera la clase).
// Se usa para saber qué campos exigir y cuáles copiar: cualquier otro
// campo que llegue en los datos se descarta.
const SERVICE_FIELDS = [
    "name",
    "description",
    "duration",
    "price",
    "category",
    "available"
];
 
// Funciones auxiliares de validación (puras: solo reciben un valor y
// devuelven true/false).
const stringNoEmpty = (value) =>
    typeof value === "string" && value.trim() !== "";
 
const esNumPositivo = (value) =>
    typeof value === "number" && Number.isFinite(value) && value > 0;
 
const esNumNegativo = (value) =>
    typeof value === "number" && Number.isFinite(value) && value >= 0;
 
const isBoolean = (value) => typeof value === "boolean";
 

const corrertor = {
    name: [stringNoEmpty, "No puede estar vacio"],
    description: [stringNoEmpty, "No puede estar vacio"],
    duration: [esNumPositivo, "Tiene que ser un numero positivo"],
    price: [esNumNegativo, "Tiene que ser un numero negativo"],
    category: [stringNoEmpty, "No puede estar vacio"],
    available: [isBoolean, "Tiene que ser TRUE/FALSE"]
};
 
export default class ServiceManager {
    constructor(databasePath) {
        this.dbPath = databasePath;
    }
 
  
    async #save(services) {
        await writeFile(this.dbPath, JSON.stringify(services, null, 2));
    }
 
    
    #findId(id) {
        return (service) => service.id === Number(id);
    }
 
    // Valida los datos de un servicio y devuelve un objeto limpio, solo con
    // los campos permitidos (así se descarta el id y cualquier campo extra).
    //  - partial = false (alta): todos los campos son obligatorios.
    //  - partial = true (actualización): solo se validan los campos que vengan.
    #validar(data, { partial = false } = {}) {
        if (!data || typeof data !== "object" || Array.isArray(data)) {
            throw new Error("serviceData tiene que ser un objeto");
        }
 
        const clean = {};
 
        for (const field of SERVICE_FIELDS) {
            const value = data[field];
 
            // Campo ausente: en un alta es error; en una actualización se salta.
            if (value === undefined || value === null) {
                if (partial) continue;
                throw new Error(`Campo ${field} es obligatorio`);
            }
 
            // Campo presente: se valida su tipo y su rango.
            const [isValid, message] = corrertor[field];
            if (!isValid(value)) {
                throw new Error(`Campo ${field} ${message}`);
            }
 
            clean[field] = value;
        }
 
        return clean;
    }
 
    // Devuelve todos los servicios leyendo el archivo JSON.
    async getServices() {
        const data = await readFile(this.dbPath, "utf-8");
        return JSON.parse(data);
    }
 
    // Devuelve el servicio con ese id, o null si no existe.
    async getServiceById(idService) {
        const services = await this.getServices();
        const service = services.find(this.#findId(idService));
        return service ?? null;
    }
 
    // Agrega un servicio nuevo. No recibe id: lo genera la clase.
    async addService(serviceData) {
        // Lanza un error si falta un campo o tiene un tipo inválido.
        // 'clean' no contiene el id aunque venga en serviceData.
        const clean = this.#validar(serviceData);
 
        const services = await this.getServices();
 
        // Id autoincremental: el mayor id existente + 1 (o 1 si no hay servicios).
        const id =
            services.length > 0
                ? Math.max(...services.map((service) => service.id)) + 1
                : 1;
 
        const newService = { id, ...clean };
 
        services.push(newService);
        await this.#save(services);
        return newService;
    }
 
    // Actualiza solo los campos enviados. Nunca modifica el id.
    async updateService(idService, updatedData) {
        // Valida solo los campos que vengan (partial) y descarta el resto,
        // incluido cualquier id que se intente enviar.
        const changes = this.#validar(updatedData, { partial: true });
 
        const services = await this.getServices();
        const index = services.findIndex(this.#findId(idService));
 
        if (index === -1) {
            return { payload: null, status: "notOk", message: "serviceNotFound" };
        }
 
        // Se copian los datos actuales, se pisan con los cambios y se
        // vuelve a poner el id original al final para que sea inmodificable.
        services[index] = {
            ...services[index],
            ...changes,
            id: services[index].id
        };
 
        await this.#save(services);
        return { payload: services[index], status: "ok" };
    }
 
    // Elimina el servicio con ese id.
    async deleteService(idService) {
        const services = await this.getServices();
 
        // Se queda con todos los servicios menos el que se quiere borrar.
        const remainingServices = services.filter(
            (service) => service.id !== Number(idService)
        );
 
        // Si la cantidad no cambió, no existía ese id.
        if (remainingServices.length === services.length) {
            return { payload: idService, status: "notOk", message: "serviceNotFound" };
        }
 
        await this.#save(remainingServices);
        return { payload: idService, status: "ok" };
    }
}