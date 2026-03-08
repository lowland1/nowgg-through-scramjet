import express from 'express';
import { createServer } from 'http';
import { createBareServer } from '@tomphttp/bare-server-node';
import { server as wisp } from '@mercuryworkshop/wisp-js/server';
import next from 'next';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const dev = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  const httpServer = createServer(server);
  
  const bareServer = createBareServer('/bare/');

  server.use(express.static('public'));

  // Serve scramjet files
  const scramjetPath = dirname(fileURLToPath(import.meta.resolve('@mercuryworkshop/scramjet/package.json')));
  server.use('/scramjet/', express.static(join(scramjetPath, 'dist')));

  // Serve bare-mux files
  const bareMuxPath = dirname(fileURLToPath(import.meta.resolve('@mercuryworkshop/bare-mux/package.json')));
  server.use('/bare-mux/', express.static(join(bareMuxPath, 'dist')));

  // Serve epoxy-transport files
  const epoxyPath = dirname(fileURLToPath(import.meta.resolve('@mercuryworkshop/epoxy-transport/package.json')));
  server.use('/epoxy/', express.static(join(epoxyPath, 'dist')));

  server.all('/bare/*', (req, res, next) => {
    if (bareServer.shouldRoute(req)) {
      bareServer.routeRequest(req, res);
    } else {
      next();
    }
  });

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  httpServer.on('upgrade', (req, socket, head) => {
    if (bareServer.shouldRoute(req)) {
      bareServer.routeUpgrade(req, socket, head);
    } else if (req.url?.startsWith('/wisp/')) {
      wisp.routeRequest(req, socket, head);
    } else {
      socket.end();
    }
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
