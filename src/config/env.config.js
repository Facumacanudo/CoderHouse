import "dotenv/config";
/*
Ahora, si uso valores por defecto como ?? "development", la aplicación sigue 
funcionando aunque falte una variable. Eso no es Fail-Fast: Fail-Fast significa 
detener el inicio inmediatamente y mostrar un error claro si la configuración 
requerida no es válida.

export const PORT = process.env.PORT ?? 3000;
export const NODE_ENV = process.env.NODE_ENV ?? "development";

*/

const port = Number(process.env.PORT);
if (!process.env.PORT || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT debe ser un número entero entre 1 y 65535");
}

const nodeEnv = process.env.NODE_ENV;

const envPermitidos = ["development", "production", "test"];
    if (!envPermitidos.includes(nodeEnv)) {
    throw new Error(`NODE_ENV debe ser uno de los siguientes valores: ${envPermitidos.join(", ")}`
    );
}
