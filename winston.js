const winston = require('winston');

const options = {
  file_debug: {
    filename: './logs/debug.log',
    level: 'debug',
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      winston.format.json()
    )
  },
  console: {
    level: 'debug',
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }
};

const logger = winston.createLogger({
  format: winston.format.combine(winston.format.errors({ stack: true })),
  transports: [new winston.transports.File(options.file_debug)]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console(options.console));
}

exports.logger = logger;
