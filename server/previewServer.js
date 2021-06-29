import Express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import config from '../webpack/config.dev';
import embedRoutes from './routes/embed.routes';
import assetRoutes from './routes/asset.routes';
import renderPreviewIndex from './views/previewIndex';

const app = new Express();

// This also works if you take out the mongoose connection
// but i have no idea why
const mongoConnectionString = process.env.MONGO_URL;
// Connect to MongoDB
mongoose.Promise = global.Promise;
mongoose.connect(mongoConnectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.set('useCreateIndex', true);
mongoose.connection.on('error', () => {
  console.error(
    'MongoDB Connection Error. Please make sure that MongoDB is running.'
  );
  process.exit(1);
});

// Run Webpack dev server in development mode
if (process.env.NODE_ENV === 'development') {
  const compiler = webpack(config);
  app.use(
    webpackDevMiddleware(compiler, {
      publicPath: config.output.publicPath
    })
  );
  app.use(webpackHotMiddleware(compiler));
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
