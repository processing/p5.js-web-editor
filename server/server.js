import Express from 'express';
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

app.use(Express.static(path.resolve(__dirname, '../static')));

app.get("/", function(req, res) {
  res.sendFile(path.resolve(__dirname + '/../index.html'));
})

// start app
app.listen(serverConfig.port, (error) => {
  if (!error) {
    console.log(`p5js web editor is running on port: ${serverConfig.port}!`); // eslint-disable-line
  }
});

export default app;