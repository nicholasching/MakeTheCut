import express, { type Application, Router } from "express";
import path from 'node:path';
import fs from 'node:fs';
import cors from 'cors'
import { fileURLToPath, pathToFileURL } from 'url';
import logger from './config/logger.js';
import connectDatabase from "./config/db.js";
import { pinoHttp } from 'pino-http';

// Most important is we have a db connection available before we do anything
connectDatabase();

const app: Application = express();

/**========================================================================
 *                           Middleware
 *========================================================================**/
// CORS configuration - allow requests from test bench and frontend

if (process.env.NODE_ENV === 'dev') {
    app.use(cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps, Postman, or file:// URLs)
            if (!origin) return callback(null, true);

            // Allow localhost and file:// origins for testing
            const allowedOrigins = [
                'http://localhost:3000',
                'http://localhost:8080', // Test bench server
            ];

            if (allowedOrigins.includes(origin) || origin.startsWith('file://')) {
                callback(null, true);
            } else {
                callback(null, true); // Allow all origins for development/testing
            }
        },
        credentials: true, // Allow cookies and authentication headers
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));
}
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

    // Recursively scan a directory and load all route files
    async function scanDirectory(dirPath: string, baseRoute: string = '') {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);

            if (entry.isDirectory()) {
                // Recurse into subdirectory with the directory name added to the route
                await scanDirectory(fullPath, `${baseRoute}/${entry.name}`);
            } else if ((entry.name.endsWith('.ts') || entry.name.endsWith('.js')) && !entry.name.endsWith('.d.ts')) {
                const fileUrl = pathToFileURL(fullPath).href;
                const routeModule = await import(fileUrl);

                const fileName = entry.name.split('.')[0];

                // If the file is 'index', use the base route, otherwise append the filename
                const routePath = fileName === 'index'
                    ? (baseRoute || '/')
                    : `${baseRoute}/${fileName}`;

                if (routeModule.default) {
                    app.use(routePath, routeModule.default as Router);
                    logger.info(`Mounted: ${routePath}`);
                }
            }
        }
    }

    await scanDirectory(routesPath);
}

// Load routes and listen on 0.0.0.0 (should be run under docker in prod)
await loadRoutes();
// hard coded because docker :)
app.listen(3000);

export { app }