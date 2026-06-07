// Tiny zero-dep server for the theme editor.
// Serves index.html, returns current draft via GET /tokens, saves via POST /save.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const draftPath = path.join(dir, 'theme-draft.json');
const PORT = 7777;

http
  .createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/save') {
      let body = '';
      req.on('data', (d) => (body += d));
      req.on('end', () => {
        try {
          JSON.parse(body); // validate
          fs.writeFileSync(draftPath, body);
          console.log('[saved] theme-draft.json', new Date().toISOString());
          res.writeHead(200, { 'content-type': 'application/json' });
          res.end('{"ok":true}');
        } catch {
          res.writeHead(400);
          res.end('{"ok":false}');
        }
      });
      return;
    }
    if (req.url === '/tokens') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(fs.existsSync(draftPath) ? fs.readFileSync(draftPath) : '{}');
      return;
    }
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(fs.readFileSync(path.join(dir, 'index.html')));
  })
  .listen(PORT, () => console.log(`theme editor → http://localhost:${PORT}`));
