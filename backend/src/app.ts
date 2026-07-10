import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { CORS_ORIGINS, env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import csvRoutes from './routes/csv.routes';
import healthRoutes from './routes/health.routes';

export function createApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(compression());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow non-browser tools (curl, health checks) with no origin header.
        if (!origin || CORS_ORIGINS.includes(origin) || CORS_ORIGINS.includes('*')) {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
      },
      credentials: true,
    })
  );

  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));

  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  }

  app.use('/api/health', healthRoutes);
  app.use('/api/csv', csvRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
