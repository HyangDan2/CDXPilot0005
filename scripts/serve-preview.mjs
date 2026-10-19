import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve('dist');
const prefix = '/valkyrie/';
const mime = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.json': 'application/json',
};
http
  .createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      if (pathname === '/') {
        res.writeHead(302, { Location: prefix });
        res.end();
        return;
      }
      if (!pathname.startsWith(prefix)) {
        res.writeHead(404);
        res.end();
        return;
      }
      const target = path.resolve(root, pathname.slice(prefix.length) || 'index.html');
      if (!target.startsWith(root + path.sep)) {
        res.writeHead(403);
        res.end();
        return;
      }
      const bytes = await readFile(target);
      res.writeHead(200, {
        'Content-Type': mime[path.extname(target)] ?? 'application/octet-stream',
      });
      res.end(bytes);
    } catch {
      res.writeHead(404);
      res.end('Not found');
    }
  })
  .listen(Number(process.env.PORT ?? 4173), '127.0.0.1', () =>
    console.log('Production fixture at http://127.0.0.1:4173/valkyrie/'),
  );
