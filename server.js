import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApiMiddleware } from './server-api.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, 'dist');
const PORT = parseInt(process.env.PORT || '3000', 10);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

const apiMiddleware = createApiMiddleware();

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Handle /api/* routes via server-api.js
  const urlPath = (req.url || '/').split('?')[0];
  if (urlPath.startsWith('/api/')) {
    await apiMiddleware(req, res, () => {
      res.statusCode = 404;
      res.end(JSON.stringify({ ok: false, error: 'Not found' }));
    });
    return;
  }

  // Serve static files from dist/
  let safePath = path.normalize(urlPath).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') safePath = '/index.html';
  let filePath = path.join(distDir, safePath);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(distDir, 'index.html');
  }

  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath).toLowerCase();
    res.statusCode = 200;
    res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
    if (ext === '.svg' || ext === '.png' || ext === '.jpg' || ext === '.js' || ext === '.css') {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.statusCode = 404;
    res.end('PaxtaBox build topilmadi.');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 PaxtaBox (@CaseBot) Server running on port ${PORT}`);
});

// Self-ping every 10 minutes on Render to keep @CaseBot poller & Trade-Ban worker active 24/7
const externalUrl = process.env.RENDER_EXTERNAL_URL;
if (externalUrl) {
  setInterval(() => {
    fetch(`${externalUrl}/api/health`).catch(() => {});
  }, 10 * 60 * 1000);
}
