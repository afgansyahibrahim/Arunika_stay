import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const port = Number(process.env.PORT || 8013);
const deployment = JSON.parse(await fs.readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
const securityHeaders = Object.fromEntries(
    deployment.headers[0].headers.map(({ key, value }) => [key, value]),
);
const types = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.woff2': 'font/woff2',
    '.txt': 'text/plain; charset=utf-8',
    '.xml': 'application/xml; charset=utf-8',
};
http.createServer(async (request, response) => {
    try {
        const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
        const filename = path.resolve(root, '.' + pathname);
        if (filename !== root && !filename.startsWith(root + path.sep)) {
            response.writeHead(403);
            return response.end('Forbidden');
        }
        let resolved = filename;
        if ((await fs.stat(resolved)).isDirectory()) resolved = path.join(resolved, 'index.html');
        const content = await fs.readFile(resolved);
        response.writeHead(200, {
            ...securityHeaders,
            ...(pathname.startsWith('/admin') ? { 'X-Robots-Tag': 'noindex, nofollow' } : {}),
            'Content-Type': types[path.extname(resolved)] || 'application/octet-stream',
            'Cache-Control': 'no-store',
            'X-Content-Type-Options': 'nosniff',
        });
        response.end(content);
    } catch {
        response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        response.end(await fs.readFile(path.join(root, '404.html')));
    }
}).listen(port, '127.0.0.1', () => console.log(`Portfolio preview: http://127.0.0.1:${port}`));
