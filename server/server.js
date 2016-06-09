import Express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import path from 'path';

//Webpack Requirements
import webpack from 'webpack';
import config from '../webpack.config';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

const app = new Express();

//add check if production environment here
const compiler = webpack(config);
app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: config.output.publicPath }));
app.use(webpackHotMiddleware(compiler));

//Import all required modules
import serverConfig from './config';
import users from './routes/user.routes';

//Body parser, cookie parser, sessions, serve public assets
const MongoStore = require('connect-mongo')(session);

app.use(Express.static(path.resolve(__dirname, '../static')));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
	//this should be SECRET AND IN A SECRET FILE
	//TODO add dotenv
	secret: 'steve brule',
	resave: true,
	saveUninitialized: true,
	store: new MongoStore({
    // url: process.env.MONGODB_URI || process.env.MONGOLAB_URI,
    url: serverConfig.mongoURL,
    autoReconnect: true
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(Express.static(path.resolve(__dirname, '../static')));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use('/', users);

const passportConfig = require('./config/passport');

//Connect to MongoDB
// mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
mongoose.connect(serverConfig.mongoURL);
mongoose.connection.on('error', () => {
  console.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});

const passportConfig = require('./config/passport');

app.get("/", function(req, res) {
  res.sendFile(path.resolve(__dirname + '/../index.html'));
})
app.get("/login", function(req, res) {
  res.sendFile(path.resolve(__dirname + '/../index.html'));
})

// start app
app.listen(serverConfig.port, (error) => {
  if (!error) {
    console.log(`p5js web editor is running on port: ${serverConfig.port}!`); // eslint-disable-line
  }
});

export default app;