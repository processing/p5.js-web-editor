import winston from 'winston';

const { combine, timestamp, printf, colorize, align } = winston.format;

// eslint-disable-next-line import/prefer-default-export
export const developmentLogger = () => {
  const logger = winston.createLogger({
    level: 'debug',
    format: combine(
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      align(),
      colorize({ all: true }),
      printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
    ),
    transports: [new winston.transports.Console()]
  });
  return logger;
};
