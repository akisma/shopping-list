/**
 * Error handling middleware - centralized error responses
 */

import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import type { Logger } from 'pino';

interface ErrorResponse {
  code: string;
  message: string;
  details?: unknown;
  timestamp: string;
  path: string;
}

export function errorHandler(logger: Logger) {
  return (err: Error, req: Request, res: Response, _next: NextFunction) => {
    const timestamp = new Date().toISOString();
    const path = req.path;

    logger.error({
      err,
      path,
      method: req.method,
      timestamp
    }, 'Request error');

    // Zod validation errors
    if (err instanceof ZodError) {
      const response: ErrorResponse = {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: err.flatten().fieldErrors,
        timestamp,
        path
      };
      return res.status(400).json(response);
    }

    // Business logic errors (from services)
    if (err.message.includes('not found')) {
      const response: ErrorResponse = {
        code: 'NOT_FOUND',
        message: err.message,
        timestamp,
        path
      };
      return res.status(404).json(response);
    }

    if (err.message.includes('past')) {
      const response: ErrorResponse = {
        code: 'VALIDATION_ERROR',
        message: err.message,
        timestamp,
        path
      };
      return res.status(400).json(response);
    }

    // Generic server errors
    const response: ErrorResponse = {
      code: 'INTERNAL_ERROR',
      message: 'An internal server error occurred',
      timestamp,
      path
    };
    return res.status(500).json(response);
  };
}
