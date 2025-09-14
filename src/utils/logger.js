const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize, splat } = format;

const logFormat = printf(({ level, message, timestamp, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${timestamp} [${level}] ${message}${metaStr}`;
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(timestamp(), splat(), logFormat),
  transports: [new transports.Console({ format: combine(colorize(), timestamp(), splat(), logFormat) })],
});

module.exports = logger;
