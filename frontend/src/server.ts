import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const indexHtml = existsSync(resolve(browserDistFolder, 'index.csr.html'))
  ? resolve(browserDistFolder, 'index.csr.html')
  : resolve(browserDistFolder, 'index.html');

const app = express();

const renderHostname = process.env['RENDER_EXTERNAL_HOSTNAME'];

const angularApp = new AngularNodeAppEngine({
  allowedHosts: [
    'localhost',
    'localhost:4000',
    '127.0.0.1',
    '127.0.0.1:4000',
    '0.0.0.0',
    '0.0.0.0:4000',
    ...(renderHostname ? [renderHostname] : []),
  ],
  trustProxyHeaders: true,
});

app.disable('x-powered-by');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/robots.txt', (_req, res) => {
  res.type('text/plain');
  res.send('User-agent: *\nAllow: /\n');
});

app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    immutable: true,
    index: false,
    redirect: false,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
    },
  }),
);

app.get('/.well-known/appspecific/com.chrome.devtools.json', (_req, res) => {
  res.status(204).end();
});

app.all(/^\/api(\/|$)/, (_req, res) => {
  res.status(404).json({ message: 'API routes are not handled by the Angular SSR server.' });
});

app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.status(404).json({
      message: `${req.method} ${req.originalUrl} is not handled by the Angular SSR server.`,
    });
    return;
  }

  angularApp
    .handle(req, { server: 'express' })
    .then((response) => {
      if (response) {
        writeResponseToNodeResponse(response, res);
        return;
      }
      res.sendFile(indexHtml, (err) => {
        if (err) next(err);
      });
    })
    .catch(next);
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Express error:', err.message);
  res.status(500).send(`Server error: ${err.message}`);
});

if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  const host = '0.0.0.0';
  app.listen(+port, host, () => {
    console.log(`Node Express server listening on http://${host}:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);
