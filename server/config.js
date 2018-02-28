const config = {
  mongoURL: process.env.MONGO_URL || 'mongodb://localhost:27017/p5js-web-editor',
  port: process.env.PORT || 8000,
  p5versionURL: 'https://p5js.org/download/version.json',
};

export default config;
