import Express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import session from 'express-session';
import connectMongo from 'connect-mongo';
import passport from 'passport';
import path from 'path';

// Webpack Requirements
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import config from '../webpack.config.dev';

// Import all required modules
import serverConfig from './config';
import users from './routes/user.routes';
import sessions from './routes/session.routes';
import projects from './routes/project.routes';
import files from './routes/file.routes';
import aws from './routes/aws.routes';
import serverRoutes from './routes/server.routes';
import embedRoutes from './routes/embed.routes';
import assetRoutes from './routes/asset.routes';
import { requestsOfTypeJSON } from './utils/requestsOfType';

import { renderIndex } from './views/index';
import { get404Sketch } from './views/404Page';

const app = new Express();
const MongoStore = connectMongo(session);

const corsOriginsWhitelist = [
  /p5js\.org$/,
];

// Run Webpack dev server in development mode
if (process.env.NODE_ENV === 'development') {
  const compiler = webpack(config);
  app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: config.output.publicPath }));
  app.use(webpackHotMiddleware(compiler));

  corsOriginsWhitelist.push(/localhost/);
}

// Enable Cross-Origin Resource Sharing (CORS) for all origins
const corsMiddleware = cors({
  credentials: true,
  origin: corsOriginsWhitelist,
});
app.use(corsMiddleware);
// Enable pre-flight OPTIONS route for all end-points
app.options('*', corsMiddleware);

// Body parser, cookie parser, sessions, serve public assets

app.use(Express.static(path.resolve(__dirname, '../static'), {
  maxAge: process.env.STATIC_MAX_AGE || (process.env.NODE_ENV === 'production' ? '1d' : '0')
}));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(session({
  resave: true,
  saveUninitialized: false,
  secret: process.env.SESSION_SECRET,
  proxy: true,
  name: 'sessionId',
  cookie: {
    httpOnly: true,
    secure: false,
  },
  store: new MongoStore({
    url: process.env.MONGO_URL,
    autoReconnect: true
  })
}));

app.use(passport.initialize());
app.use(passport.session());
app.use('/api', requestsOfTypeJSON(), users);
app.use('/api', requestsOfTypeJSON(), sessions);
app.use('/api', requestsOfTypeJSON(), projects);
app.use('/api', requestsOfTypeJSON(), files);
app.use('/api', requestsOfTypeJSON(), aws);
app.use(assetRoutes);
// this is supposed to be TEMPORARY -- until i figure out
// isomorphic rendering
app.use('/', serverRoutes);

app.use('/', embedRoutes);
app.get('/auth/github', passport.authenticate('github'));
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
  res.redirect('/');
});

// configure passport
require('./config/passport');
// const passportConfig = require('./config/passport');

// Connect to MongoDB
// mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
mongoose.connect(serverConfig.mongoURL);
mongoose.connection.on('error', () => {
  console.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});

app.get('/', (req, res) => {
  res.sendFile(renderIndex());
});

// Handle missing routes.
app.get('*', (req, res) => {
  res.status(404);
  if (req.accepts('html')) {
    get404Sketch(html => res.send(html));
    return;
  }
  if (req.accepts('json')) {
    res.send({ error: 'Not found.' });
    return;
  }
  res.type('txt').send('Not found.');
});

// start app
app.listen(serverConfig.port, (error) => {
  if (!error) {
    console.log(`p5js web editor is running on port: ${serverConfig.port}!`); // eslint-disable-line
  }
});

export default app;
