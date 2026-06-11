import Express from 'express';
import path from 'path';
import webpack from 'webpack';
import cors from 'cors';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from '@gatsbyjs/webpack-hot-middleware';
import config from '../webpack/config.dev';
import embedRoutes from './routes/embed.routes';
import assetRoutes from './routes/asset.routes';
import { renderPreviewIndex } from './views/previewIndex';

const app = new Express();

// The preview server is stateless: sketch files and code are fetched from
// OpenProcessing on demand (see asset.controller). There is no local database.

const allowedCorsOrigins = [
  /p5js\.org$/,
  process.env.EDITOR_URL,
  process.env.PREVIEW_URL
];

// to allow client-only development
if (process.env.CORS_ALLOW_LOCALHOST === 'true') {
  allowedCorsOrigins.push(/localhost/);
}

// Enable Cross-Origin Resource Sharing (CORS)
const corsMiddleware = cors({
  credentials: true,
  origin: allowedCorsOrigins
});
app.use(corsMiddleware);
// Enable pre-flight OPTIONS route for all end-points
app.options('*', corsMiddleware);

// Run Webpack dev server in development mode
if (process.env.NODE_ENV === 'development') {
  const compiler = webpack(config);
  app.use(
    webpackDevMiddleware(compiler, {
      publicPath: config.output.publicPath
    })
  );
  app.use(webpackHotMiddleware(compiler, { log: false }));
}

app.use(
  Express.static(path.resolve(__dirname, '../dist/static'), {
    maxAge:
      process.env.STATIC_MAX_AGE ||
      (process.env.NODE_ENV === 'production' ? '1d' : '0')
  })
);

app.get('/', (req, res) => {
  res.send(renderPreviewIndex());
});

app.use('/', embedRoutes);
app.use('/', assetRoutes);

// Handle missing routes.
app.get('*', (req, res) => {
  res.status(404);
  res.type('txt').send('Not found.');
});

app.listen(process.env.PREVIEW_PORT, (error) => {
  if (!error) {
    console.log(
      `p5.js Preview Server is running on port: ${process.env.PREVIEW_PORT}`
    );
  }
});

export default app;
