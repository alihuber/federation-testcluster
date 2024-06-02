import winston, { createLogger, format } from 'winston';

const { combine, printf, label: flabel, timestamp: ftimestamp } = format;

const loggerFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const transports = {
  console: new winston.transports.Console({ level: 'info' }),
};

export const getLogger = (lbl: string): winston.Logger => {
  return createLogger({
    format: combine(flabel({ label: lbl }), ftimestamp(), loggerFormat),
    transports: [transports.console],
  });
};

export const getLogLevel = () => {
  return transports.console.level;
};

// silly=0 (lowest)
// debug=1
// verbose=2
// info=3
// warn=4
// error=5 (highest)

export const setLevel = (level: string) => {
  transports.console.level = level;
};
