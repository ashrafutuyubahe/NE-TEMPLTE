import app from './app';
import { AppDataSource } from './config/data-source';
import { logger } from './utils/logger';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;


AppDataSource.initialize()
  .then(() => {
    logger.info('Database connected successfully', {
      action: 'database_connection',
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
    });

   
    app.listen(PORT, () => {
      logger.info('Server started successfully', {
        action: 'server_start',
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
      });
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Logs directory: ${process.cwd()}/logs`);
    });
  })
  .catch((error) => {
    logger.error('Error during database initialization', {
      action: 'database_connection',
      error: error.message,
      stack: error.stack,
    });
    console.error('Error during database initialization:', error);
    process.exit(1);
  });

