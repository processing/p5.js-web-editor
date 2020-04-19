import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';

import config from '../webpack/config.dev';
import serverRoutes from './routes/server.routes';

const app = express();

const compiler = webpack(config);

// Tell express to use the webpack-dev-middleware and use the webpack.config.js
// configuration file as a base.
app.use(webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath,
}));

// Server Editor page templates
app.use(serverRoutes);

const apiPort = process.env.PORT;
const clientPort = process.env.CLIENT_PORT || 3000;

app.listen(clientPort, () => {
  console.log(`Access local Editor at http://localhost:${clientPort}

You must set API_URL in .env to the editor API e.g.

API_URL=https://editor.p5js.org/editor

If you're running the editor API locally, use:

API_URL=http://localhost:${apiPort}/editor
`);
});
