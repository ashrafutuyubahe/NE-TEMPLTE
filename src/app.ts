import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import bookRoutes from './routes/bookRoutes';
import borrowRoutes from './routes/borrowRoutes';
import userRoutes from './routes/userRoutes';
import { logger, logApiRequest } from './utils/logger';
import { AuthRequest } from './middleware/auth';

dotenv.config();

const app: Application = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const userId = (req as AuthRequest).user?.id || 'anonymous';
  const userRole = (req as AuthRequest).user?.role || 'anonymous';

  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userId,
    userRole,
    userAgent: req.get('user-agent'),
  });

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId,
      userRole,
    });
  });

  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrow', borrowRoutes);
app.use('/api/users', userRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Library Management System API is running' });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const userId = (req as AuthRequest).user?.id || 'anonymous';
  const userRole = (req as AuthRequest).user?.role || 'anonymous';

  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    userId,
    userRole,
  });

  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

export default app;

