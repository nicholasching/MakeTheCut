import express from "express";
import setupEnv from './secrets.js'
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'url';

await setupEnv();

const app = express();

/**========================================================================
 *                           Middleware
 *========================================================================**/
app.use(express.json());


/**========================================================================
 *                           Routes
 *========================================================================**/
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadRoutes() {
    const routesPath = path.join(__dirname, 'routes');

    // 1. Read all files in the routes directory
    const files = fs.readdirSync(routesPath);

    for (const file of files) {
        if ((file.endsWith('.ts') || file.endsWith('.js')) && !file.endsWith('.d.ts')) {
            const fullPath = pathToFileURL(path.join(routesPath, file)).href;
            const routeModule = await import(fullPath);

            const fileName = file.split('.')[0];

            // If the file is 'index', mount to '/', otherwise mount to '/filename'
            const routePath = fileName === 'index' ? '/' : `/${fileName}`;

            if (routeModule.default) {
                app.use(routePath, routeModule.default);
                console.log(`✅ Mounted: ${routePath}`);
            }
        }
    }
}

await loadRoutes();


app.listen(process.env.PORT);

export { app }