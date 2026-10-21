import { writeFile, readFile } from "node:fs/promises";
/*En ServiceManager.js, data.find(...) devuelve undefined si no hay coincidencias. 
La consigna pide null o un mensaje de error.*/
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
        return data.find(this.#findId(idService));

            if(data.find(this.#findId(idService)) === undefined){
                return null;
                throw new Error(`Service with id ${idService} not found`);
            }
    }

    async addService(serviceData) {
        for (const field of REQUIRED_FIELDS) {
            if (serviceData[field] === undefined || serviceData[field] === null) {
                throw new Error(`Field ${field} is required`);
            }
        }

        const data = await this.getServices();
        const id = data.length > 0 ? Math.max(...data.map((service) => service.id)) + 1 : 1;
        const newService = { ...serviceData, id };

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