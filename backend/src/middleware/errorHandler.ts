import { NextFunction, Request, Response } from 'express';
import { MulterError } from 'multer';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';
import { env } from '../config/env';

interface ErrorResponseBody {
  success: false;
  error: {
    message: string;
    code: string;
    stack?: string;
  };
}

/** 404 handler for unmatched routes - registered after all real routes. */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.originalUrl} not found`,
      code: 'ROUTE_NOT_FOUND',
    },
  });
}

/**
 * Centralized error handler. Must be registered last, after all routes and
 * other middleware, per Express conventions (4 arguments signals to Express
 * that this is an error-handling middleware).
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  let statusCode = 500;
  let message = 'Internal server error';
  let code = 'INTERNAL_ERROR';

  if (err instanceof MulterError) {
    statusCode = 400;
    code = `UPLOAD_${err.code}`;
    message =
      err.code === 'LIMIT_FILE_SIZE'
        ? `File too large. Maximum allowed size is ${env.MAX_FILE_SIZE_MB}MB.`
        : err.message;
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;
  } else if (err instanceof Error) {
    message = env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  }

  logger.error(`${req.method} ${req.originalUrl} -> ${statusCode} ${code}`, {
    message: err instanceof Error ? err.message : String(err),
  });

  const body: ErrorResponseBody = {
    success: false,
    error: { message, code },
  };

  if (env.NODE_ENV !== 'production' && err instanceof Error) {
    body.error.stack = err.stack;
  }

  res.status(statusCode).json(body);
}
