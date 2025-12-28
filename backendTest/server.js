#!/usr/bin/env node

/**
 * Simple HTTP server to serve the test bench HTML file
 * This is needed because cookies don't work properly with file:// protocol
 * 
 * Usage: node server.js
 * Then open: http://localhost:8080
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 8080;
const HTML_FILE = path.join(__dirname, 'index.html');

const server = http.createServer((req, res) => {
    // Serve the HTML file
    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile(HTML_FILE, (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading index.html');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(PORT, () => {
    console.log(`\n✅ Test bench server running!`);
    console.log(`📂 Open in browser: http://localhost:${PORT}`);
    console.log(`\n⚠️  Make sure your backend is running on http://localhost:3000\n`);
});

