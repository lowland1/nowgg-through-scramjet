import express from 'express';
import { createServer } from 'http';
import { createBareServer } from '@tomphttp/bare-server-node';
import { server as wisp } from '@mercuryworkshop/wisp-js/server';
import next from 'next';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const dev = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  console.log('> Next.js app prepared');
  const server = express();
  const httpServer = createServer(server);
  
  const bareServer = createBareServer('/bare/');

  server.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      if (req.url?.startsWith('/_next') || res.statusCode >= 400) {
        console.log(`${req.method} ${req.url} ${res.statusCode} ${Date.now() - start}ms`);
      }
    });
    next();
  });

  server.use(express.static('public'));
  server.use('/_next/static', express.static(join(process.cwd(), '.next/static')));

  // Serve scramjet files
  const scramjetPath = dirname(require.resolve('@mercuryworkshop/scramjet/package.json'));
  server.use('/scramjet/', express.static(join(scramjetPath, 'dist')));

  // Serve bare-mux files
  const bareMuxPath = dirname(require.resolve('@mercuryworkshop/bare-mux/package.json'));
  server.use('/bare-mux/', express.static(join(bareMuxPath, 'dist')));

  // Serve epoxy-transport files
  const epoxyPath = dirname(require.resolve('@mercuryworkshop/epoxy-transport/package.json'));
  server.use('/epoxy/', express.static(join(epoxyPath, 'dist')));

  server.all('/bare/*', (req, res, next) => {
    if (bareServer.shouldRoute(req)) {
      bareServer.routeRequest(req, res);
    } else {
      next();
    }
  });

  server.all('/_next/*', (req, res) => {
    return handle(req, res);
  });

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  httpServer.on('upgrade', (req, socket, head) => {
    if (bareServer.shouldRoute(req)) {
      bareServer.routeUpgrade(req, socket, head);
    } else if (req.url?.startsWith('/wisp')) {
      wisp.routeRequest(req, socket, head);
    } else {
      // Allow other upgrades (like Next.js HMR if it were enabled)
      // but for now just handle it gracefully
      if (dev) {
        // In dev mode, Next.js might want to upgrade for HMR
        // We don't want to kill the socket immediately if we don't know what it is
        // but we also don't have a handler for it other than Next.js
        // Actually, Next.js handles its own upgrades if we let it, 
        // but we are using a custom httpServer.
      }
    }
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
