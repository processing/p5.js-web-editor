import winston from 'winston';

const options = {
  file_info: {
    filename: './logs/info.log',
    level: 'info'
  },
  console: {
    level: 'debug',
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(
        ({ service, level, message, timestamp }) =>
          `[${service}] [${level}]: ${message} [${timestamp}]`
      )
    )
  }
};

const logger = winston.createLogger({
  defaultMeta: { service: 'p5.js-Web-Editor' },
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.json()
  ),
  transports: [new winston.transports.File(options.file_info)]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console(options.console));
}

export default logger;
