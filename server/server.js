import Express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
const MongoStore = require('connect-mongo')(session);
import passport from 'passport';
import path from 'path';

// Webpack Requirements
import webpack from 'webpack';
import config from '../webpack.config.dev';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

const app = new Express();

// Run Webpack dev server in development mode
if (process.env.NODE_ENV === 'development') {
  const compiler = webpack(config);
  app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: config.output.publicPath }));
  app.use(webpackHotMiddleware(compiler));
}

// Import all required modules
import serverConfig from './config';
import users from './routes/user.routes';
import sessions from './routes/session.routes';
import projects from './routes/project.routes';
import files from './routes/file.routes';
import aws from './routes/aws.routes';
import serverRoutes from './routes/server.routes';
import embedRoutes from './routes/embed.routes';

// Body parser, cookie parser, sessions, serve public assets

app.use(Express.static(path.resolve(__dirname, '../static')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
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
app.use('/api', users);
app.use('/api', sessions);
app.use('/api', projects);
app.use('/api', files);
app.use('/api', aws);
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
  res.sendFile(path.resolve(`${__dirname}/../index.html`));
});

// start app
app.listen(serverConfig.port, (error) => {
  if (!error) {
    console.log(`p5js web editor is running on port: ${serverConfig.port}!`); // eslint-disable-line
  }
});

export default app;
