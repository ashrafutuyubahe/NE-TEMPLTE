import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta, null, 2)}`;
    }
    return msg;
  })
);

// Create daily rotate file transport for combined logs
const combinedFileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: logFormat,
});

// Create daily rotate file transport for error logs
const errorFileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxSize: '20m',
  maxFiles: '30d',
  format: logFormat,
});

// Create daily rotate file transport for activity logs
const activityFileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'activity-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  format: logFormat,
});

// Create daily rotate file transport for authentication logs
const authFileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'auth-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  format: logFormat,
});

// Create daily rotate file transport for book operations logs
const booksFileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'books-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  format: logFormat,
});

// Create daily rotate file transport for borrow operations logs
const borrowsFileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'borrows-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  format: logFormat,
});

// Create daily rotate file transport for user management logs
const usersFileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'users-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  format: logFormat,
});

// Main logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'library-management' },
  transports: [
    combinedFileTransport,
    errorFileTransport,
  ],
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join(logsDir, 'exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
    }),
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join(logsDir, 'rejections-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
    }),
  ],
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// Specialized loggers for different activities
export const activityLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'library-management', type: 'activity' },
  transports: [activityFileTransport, combinedFileTransport],
});

export const authLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'library-management', type: 'auth' },
  transports: [authFileTransport, combinedFileTransport],
});

export const booksLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'library-management', type: 'books' },
  transports: [booksFileTransport, combinedFileTransport],
});

export const borrowsLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'library-management', type: 'borrows' },
  transports: [borrowsFileTransport, combinedFileTransport],
});

export const usersLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'library-management', type: 'users' },
  transports: [usersFileTransport, combinedFileTransport],
});

// Helper function to log API requests
export const logApiRequest = (
  action: string,
  userId: string | undefined,
  userRole: string | undefined,
  details: any = {}
) => {
  activityLogger.info(action, {
    userId,
    userRole,
    ...details,
    timestamp: new Date().toISOString(),
  });
};

// Helper function to log errors with context
export const logError = (
  error: Error | string,
  context: {
    action?: string;
    userId?: string;
    userRole?: string;
    [key: string]: any;
  } = {}
) => {
  const errorMessage = error instanceof Error ? error.message : error;
  const errorStack = error instanceof Error ? error.stack : undefined;

  logger.error(errorMessage, {
    ...context,
    stack: errorStack,
    timestamp: new Date().toISOString(),
  });
};

