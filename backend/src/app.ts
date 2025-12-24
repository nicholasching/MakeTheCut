import express, { type Application } from "express";
import cors from "cors";
import setupEnv from './secrets.js'
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'url';

await setupEnv();

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

// Load routes and listen on 0.0.0.0 (should be run under docker in prod)
await loadRoutes();
app.listen(process.env.PORT || 3000);

export { app }