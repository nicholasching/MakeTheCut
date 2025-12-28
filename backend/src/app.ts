import express, { type Application, Router } from "express";
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'url';
import logger from './config/logger.js';
import connectDatabase from "./config/db.js";
import { pinoHttp } from 'pino-http';

// Most important is we have a db connection available before we do anything
connectDatabase();

const app: Application = express();

import cors from 'cors';

/**========================================================================
 *                           Middleware
 *========================================================================**/
app.use(cors({
    origin: process.env.FRONTEND_URL || '*', // Default to * for dev convenience if var not set
    credentials: true
}));
app.use(express.json());
// pino logging
app.use(pinoHttp({
    logger
}));


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
                app.use(routePath, routeModule.default as Router);
                logger.info(`Mounted: ${routePath}`);
            }
        }
    }
}

// Load routes and listen on 0.0.0.0 (should be run under docker in prod)
await loadRoutes();
// hard coded because docker :)
app.listen(3000);

export { app }