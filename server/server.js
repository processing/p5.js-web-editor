import Express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import basicAuth from 'express-basic-auth';

// Webpack Requirements
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from '@gatsbyjs/webpack-hot-middleware';
import config from '../webpack/config.dev';

// Import all required modules
import serverRoutes from './routes/server.routes';
import redirectEmbedRoutes from './routes/redirectEmbed.routes';
import passportRoutes from './routes/passport.routes';

import { get404Sketch } from './views/404Page';

const app = new Express();

app.get('/health', (req, res) => res.json({ success: true }));

const allowedCorsOrigins = [
  /p5js\.org$/,
  process.env.EDITOR_URL,
  process.env.PREVIEW_URL
];

// to allow client-only development
if (process.env.CORS_ALLOW_LOCALHOST === 'true') {
  allowedCorsOrigins.push(/localhost/);
}

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

app.set('trust proxy', true);

// Enable Cross-Origin Resource Sharing (CORS) for all origins
const corsMiddleware = cors({
  credentials: true,
  origin: allowedCorsOrigins
});
app.use(corsMiddleware);
// Enable pre-flight OPTIONS route for all end-points
app.options('*', corsMiddleware);

app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cookieParser());

// Optional HTTP basic-auth gate (used to lock down staging deployments).
// Unrelated to user authentication, which is handled entirely by
// OpenProcessing via the browser OAuth flow.
if (process.env.BASIC_USERNAME && process.env.BASIC_PASSWORD) {
  app.use(
    basicAuth({
      users: {
        [process.env.BASIC_USERNAME]: process.env.BASIC_PASSWORD
      },
      challenge: true
    })
  );
}

// Serve public assets
app.use(
  '/locales',
  Express.static(path.resolve(__dirname, '../dist/static/locales'), {
    // Browsers must revalidate for changes to the locale files
    // It doesn't actually mean "don't cache this file"
    // See: https://jakearchibald.com/2016/caching-best-practices/
    setHeaders: (res) => res.setHeader('Cache-Control', 'no-cache')
  })
);
app.use(
  Express.static(path.resolve(__dirname, '../dist/static'), {
    maxAge:
      process.env.STATIC_MAX_AGE ||
      (process.env.NODE_ENV === 'production' ? '1d' : '0')
  })
);
app.use(Express.static(path.resolve(__dirname, '../public')));

// The editor server is a stateless host for the React SPA. All user, project,
// and collection data — and authentication — is served by OpenProcessing,
// which the browser talks to directly using the per-user access token stored
// in the browser after the OAuth popup flow. The routes below only render the
// SPA shell, perform legacy URL redirects, and host the OAuth callback page.
app.use('/', serverRoutes);
app.use('/', redirectEmbedRoutes);
app.use('/', passportRoutes);

// Handle API errors
app.use('/api', (error, req, res, next) => {
  if (error && error.code && !res.headersSent) {
    console.error('API error:', error.message);
    res.status(error.code).json({ error: 'Internal server error' });
    return;
  }

  next(error);
});

// Handle missing routes.
app.get('*', async (req, res) => {
  res.status(404);
  if (req.accepts('html')) {
    try {
      const html = await get404Sketch();
      res.send(html);
    } catch (err) {
      console.error('Error generating 404 sketch:', err);
      res.send('Error generating 404 page.');
    }
    return;
  }
  if (req.accepts('json')) {
    res.send({ error: 'Not found.' });
    return;
  }
  res.type('txt').send('Not found.');
});

// Global error handler for unhandled errors
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);

  if (res.headersSent) {
    return next(error);
  }

  const statusCode = error.status || 500;
  return res.status(statusCode).json({
    error: 'Internal server error'
  });
});

// start app
app.listen(process.env.PORT, (error) => {
  if (!error) {
    console.log(`p5.js Web Editor is running on port: ${process.env.PORT}!`); // eslint-disable-line
  }
});

export default app;
