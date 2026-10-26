# Actividad Pre entrega: Administrador de servicios (Node.js)

Proyecto de práctica de Backend I que implementa un administrador de servicios para un sistema de turnos y reservas. Está desarrollado con Node.js y módulos ESM, y persiste los servicios en un archivo JSON.

## Requisitos

- Node.js (versión 18.11 o superior, para disponer de `node --watch`).
- npm.

## Instalación

Desde la carpeta del proyecto, instalá las dependencias:

```bash
npm install
```

Creá el archivo local `.env` a partir de la plantilla. En PowerShell:

```powershell
Copy-Item .env.example .env
```

## Variables de entorno

El proyecto requiere las siguientes variables:

| Variable | Descripción | Ejemplo |
| --- | --- | --- |
| `PORT` | Puerto de la aplicación; debe ser un entero entre 1 y 65535. | `8080` |
| `NODE_ENV` | Entorno de ejecución permitido: `development`, `production` o `test`. | `development` |

La plantilla `.env.example` contiene valores de ejemplo. El archivo `.env` es local y no debe subirse al repositorio. La configuración se valida al iniciar; si falta una variable o tiene un valor inválido, el proceso muestra un error y se detiene.

## Ejecución

```bash
npm start
```

Para iniciar en modo de desarrollo con reinicio al detectar cambios:

```bash
npm run dev
```

Estos comandos ejecutan `src/app.js`, que carga y valida la configuración e inicializa `ServiceManager`. La lógica de administración se utiliza desde la clase y guarda los cambios en `src/data/services.json`.

## Estructura del proyecto

```text
src/
├── config/
│   └── env.config.js
├── managers/
│   └── ServiceManager.js
├── data/
│   └── services.json
└── app.js
package.json
.env.example
.gitignore
README.md
```

## Recurso `service`

Cada servicio tiene la siguiente estructura:

```js
{
  id: 1,                       // Generado internamente por ServiceManager
  name: "Consulta inicial",
  description: "Primera consulta del paciente",
  duration: 30,                // Duración en minutos
  price: 1000,
  category: "Consulta",
  available: true
}
```

`addService` requiere `name`, `description`, `duration`, `price`, `category` y `available`. `name`, `description` y `category` deben ser textos no vacíos; `duration` debe ser un número positivo, `price` un número no negativo y `available` un booleano. El `id` no se envía: se genera automáticamente y cualquier `id` recibido en los datos de entrada se ignora. Los métodos que leen o modifican el archivo son asíncronos y deben usarse con `await`.

## Uso de `ServiceManager`

El siguiente ejemplo se puede ejecutar desde la raíz del proyecto con Node.js. Agrega un servicio de prueba, lo consulta, lo actualiza y finalmente lo elimina del archivo JSON:

```js
import path from "node:path";
import { fileURLToPath } from "node:url";
import ServiceManager from "./src/managers/ServiceManager.js";

const projectDirectory = path.dirname(fileURLToPath(import.meta.url));
const servicesFile = path.join(projectDirectory, "src", "data", "services.json");
const manager = new ServiceManager(servicesFile);

// 1. Obtener todos los servicios.
const services = await manager.getServices();
console.log(services);

// 2. Agregar un servicio. No se envía id.
const createdService = await manager.addService({
  name: "Consulta de prueba",
  description: "Servicio agregado como ejemplo",
  duration: 30,
  price: 1000,
  category: "Consulta",
  available: true
});
console.log(createdService);

// 3. Buscar un servicio por ID. Devuelve null si no existe.
const service = await manager.getServiceById(createdService.id);
console.log(service);

// 4. Actualizar un servicio. El ID se indica por separado y no se modifica.
const updateResult = await manager.updateService(createdService.id, {
  price: 1200,
  available: false
});
console.log(updateResult);

// 5. Eliminar el servicio de prueba.
const deleteResult = await manager.deleteService(createdService.id);
console.log(deleteResult);
```

`updateService` devuelve `{ payload, status }`; si el servicio no existe, `payload` es `null` y `status` es `"notOk"`. `deleteService` también informa el resultado mediante `status`.

> El ejemplo de alta, actualización y eliminación modifica `src/data/services.json`. Ejecutalo solo si querés probar esos cambios en los datos.
