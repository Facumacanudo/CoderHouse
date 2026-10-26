import { writeFile, readFile } from "node:fs/promises";
const REQUIRED_FIELDS = [
    "name",
    "description",
    "price",
    "duration",
    "category",
    "available"
];

export default class ServiceManager {
    constructor(DatabasePath) {
        this.dbPath = DatabasePath;
    }

    async #save(services) {
        await writeFile(this.dbPath, JSON.stringify(services, null, 2));
    }

    #findId(id) {
        return (service) => service.id === Number(id);
    }

    async getServices() {
        const data = await readFile(this.dbPath, "utf-8");
        return JSON.parse(data);
    }

    async getServiceById(idService) {
        const data = await this.getServices();
        const service = data.find(this.#findId(idService));

        if(service){
            return service;
        } else {
            return null;
        }
    }

    async addService(serviceData) {
        if (!serviceData || typeof serviceData !== "object" || Array.isArray(serviceData)) {
            throw new Error("serviceData must be an object");
        }

        for (const field of REQUIRED_FIELDS) {
            if (serviceData[field] === undefined || serviceData[field] === null) {
                throw new Error(`Field ${field} is required`);
            }
        }

        for (const field of ["name", "description", "category"]) {
            if (typeof serviceData[field] !== "string" || serviceData[field].trim() === "") {
                throw new Error(`Field ${field} must be a non-empty string`);
            }
        }

        if (typeof serviceData.duration !== "number" || !Number.isFinite(serviceData.duration) || serviceData.duration <= 0) {
            throw new Error("Field duration must be a positive number");
        }

        if (typeof serviceData.price !== "number" || !Number.isFinite(serviceData.price) || serviceData.price < 0) {
            throw new Error("Field price must be a non-negative number");
        }

        if (typeof serviceData.available !== "boolean") {
            throw new Error("Field available must be a boolean");
        }

        const data = await this.getServices();
        const id = data.length > 0 ? Math.max(...data.map((service) => service.id)) + 1 : 1;
        const newService = {
            id,
            name: serviceData.name,
            description: serviceData.description,
            duration: serviceData.duration,
            price: serviceData.price,
            category: serviceData.category,
            available: serviceData.available
        };

        data.push(newService);
        await this.#save(data);
        return newService;
    }

    async updateService(idService, serviceData) {
        const services = await this.getServices();
        const id = Number(idService);
        const index = services.findIndex(this.#findId(idService));

        if (index === -1) {
            return { payload: null, status: "notOk" };
        }

        services[index] = {
            ...services[index],
            ...serviceData,
            id
        };

        await this.#save(services);
        return { payload: services[index], status: "ok" };
    }

    async deleteService(idService) {

        const services = await this.getServices();
        const id = Number(idService);

        const filteredServices = services.filter(
            (service) => service.id !== id); 

        if (services.length === filteredServices.length) {
            return { 
                payload: idService, 
                status: "notOk", 
                message: "notFoundedService" };
        }

        await this.#save(filteredServices);

        return { 
            payload: idService,
            status: "ok" 
        };   
    }
}