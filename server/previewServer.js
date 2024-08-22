import Express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import webpack from 'webpack';
import cors from 'cors';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from '@gatsbyjs/webpack-hot-middleware';
import config from '../webpack/config.dev';
import embedRoutes from './routes/embed.routes';
import assetRoutes from './routes/asset.routes';
import renderPreviewIndex from './views/previewIndex';

const app = new Express();

// This also works if you take out the mongoose connection
// but i have no idea why
const mongoConnectionString = process.env.MONGO_URL;

// Connect to MongoDB
const connectToMongoDB = async () => {
  try {
    mongoose.set('strictQuery', true);

    await mongoose.connect(mongoConnectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // 30 seconds timeout
      socketTimeoutMS: 45000 // 45 seconds timeout
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB: ', error);
    process.exit(1);
  }
};

connectToMongoDB();

mongoose.connection.on('error', () => {
  console.error(
    'MongoDB Connection Error. Please make sure that MongoDB is running.'
  );
  process.exit(1);
});

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
