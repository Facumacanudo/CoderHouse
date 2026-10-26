# Actividad Pre entrega: Administrador de servicios (Node.js)

Proyecto de práctica de Backend I que implementa un administrador de servicios para un sistema de turnos y reservas. Está desarrollado con Node.js y módulos ESM, y persiste los servicios en un archivo JSON mediante la clase `ServiceManager`.

## Requisitos

- Node.js 18.11 o superior (necesario para `node --watch`).
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

En macOS o Linux:

```bash
cp .env.example .env
```

## Variables de entorno

El proyecto requiere las siguientes variables:

| Variable   | Descripción                                                           | Ejemplo       |
| ---------- | --------------------------------------------------------------------- | ------------- |
| `PORT`     | Puerto de la aplicación; debe ser un entero entre 1 y 65535.          | `8080`        |
| `NODE_ENV` | Entorno de ejecución permitido: `development`, `production` o `test`. | `development` |

La plantilla `.env.example` contiene valores de ejemplo. El archivo `.env` es local y no debe subirse al repositorio (está incluido en `.gitignore`).

La configuración se valida al iniciar (Fail-Fast): si falta una variable o tiene un valor inválido, el proceso muestra un error y se detiene antes de arrancar.

## Ejecución

```bash
npm start
```

Para iniciar en modo de desarrollo, con reinicio automático al detectar cambios:

```bash
npm run dev
```

Ambos comandos ejecutan `src/app.js`, que carga y valida la configuración e inicializa `ServiceManager`. Los cambios sobre los servicios se guardan en `src/data/services.json`.

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

- `src/config/env.config.js`: carga `dotenv`, valida las variables de entorno y las exporta.
- `src/managers/ServiceManager.js`: clase con la lógica de administración de servicios.
- `src/data/services.json`: archivo donde se persisten los servicios.
- `src/app.js`: punto de entrada de la aplicación.

## Recurso `services`

Cada servicio tiene la siguiente estructura (valores de ejemplo):

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

| Campo         | Tipo    | Regla                                                       |
| ------------- | ------- | ----------------------------------------------------------- |
| `id`          | número  | Autoincremental: se genera internamente y no se puede enviar ni modificar. |
| `name`        | string  | Obligatorio, no puede estar vacío.                          |
| `description` | string  | Obligatorio, no puede estar vacío.                          |
| `duration`    | número  | Obligatorio, mayor a 0 (minutos).                           |
| `price`       | número  | Obligatorio, mayor o igual a 0.                             |
| `category`    | string  | Obligatorio, no puede estar vacío.                          |
| `available`   | boolean | Obligatorio, `true` o `false`.                              |

El `id` se calcula como el mayor `id` existente más 1 (o `1` si no hay servicios). Cualquier `id` o campo desconocido que llegue en los datos de entrada se ignora.

Todos los métodos de `ServiceManager` leen o escriben el archivo JSON, por lo que son asíncronos y deben usarse con `await`.

## Uso de `ServiceManager`

### Preparación

Los ejemplos se pueden ejecutar desde la raíz del proyecto, por ejemplo en un archivo temporal `prueba.mjs` que no hace falta subir al repositorio:

```js
import path from "node:path";
import { fileURLToPath } from "node:url";
import ServiceManager from "./src/managers/ServiceManager.js";

const projectDirectory = path.dirname(fileURLToPath(import.meta.url));
const servicesFile = path.join(projectDirectory, "src", "data", "services.json");
const manager = new ServiceManager(servicesFile);
```

> Los ejemplos de alta, actualización y eliminación modifican `src/data/services.json`. Ejecutalos solo si querés probar esos cambios en los datos.

### `getServices()`

Devuelve un array con todos los servicios.

```js
const services = await manager.getServices();
console.log(services);
// [ { id: 1, name: "Consulta inicial", ... }, { id: 2, ... } ]
```

### `getServiceById(id)`

Devuelve el servicio con ese `id`, o `null` si no existe.

```js
const service = await manager.getServiceById(1);
console.log(service);
// { id: 1, name: "Consulta inicial", ... }

const missing = await manager.getServiceById(999);
console.log(missing);
// null
```

### `addService(serviceData)`

Agrega un servicio nuevo y devuelve el servicio creado, con su `id` generado. No se envía `id`: si llega uno, se ignora.

```js
const createdService = await manager.addService({
  name: "Consulta de prueba",
  description: "Servicio agregado como ejemplo",
  duration: 30,
  price: 1000,
  category: "Consulta",
  available: true
});
console.log(createdService);
// { id: 3, name: "Consulta de prueba", description: "Servicio agregado como ejemplo",
//   duration: 30, price: 1000, category: "Consulta", available: true }
```

Si falta un campo obligatorio o tiene un tipo o valor inválido, lanza un `Error` que indica el campo, y no guarda nada:

```js
try {
  await manager.addService({ name: "Sin precio" });
} catch (error) {
  console.log(error.message);
  // Mensaje que indica el primer campo faltante o inválido
}
```

### `updateService(id, updatedData)`

Actualiza solo los campos enviados de un servicio existente. El `id` nunca se modifica, aunque se envíe en `updatedData`.

```js
const updateResult = await manager.updateService(createdService.id, {
  price: 1200,
  available: false
});
console.log(updateResult);
// { payload: { id: 3, ..., price: 1200, available: false }, status: "ok" }
```

Si el servicio no existe, devuelve:

```js
// { payload: null, status: "notOk", message: "serviceNotFound" }
```

Si los datos enviados son inválidos (por ejemplo, `price: "gratis"`), lanza un `Error`, igual que `addService`.

### `deleteService(id)`

Elimina el servicio con ese `id`. Devuelve el `id` recibido en `payload` y el resultado en `status`.

```js
const deleteResult = await manager.deleteService(createdService.id);
console.log(deleteResult);
// { payload: 3, status: "ok" }
```

Si el servicio no existe, devuelve:

```js
// { payload: 999, status: "notOk", message: "serviceNotFound" }
```

### Resumen de respuestas

| Método                      | Éxito                               | Servicio inexistente                                           | Datos inválidos |
| --------------------------- | ----------------------------------- | -------------------------------------------------------------- | --------------- |
| `getServices()`             | Array de servicios                  | No aplica                                                      | No aplica       |
| `getServiceById(id)`        | El servicio                         | `null`                                                         | No aplica       |
| `addService(data)`          | El servicio creado (con `id`)       | No aplica                                                      | Lanza `Error`   |
| `updateService(id, data)`   | `{ payload, status: "ok" }`         | `{ payload: null, status: "notOk", message: "serviceNotFound" }` | Lanza `Error`   |
| `deleteService(id)`         | `{ payload: id, status: "ok" }`     | `{ payload: id, status: "notOk", message: "serviceNotFound" }`   | No aplica       |
