/**
 * Request logging middleware using Pino
 */

import type { Request, Response, NextFunction } from 'express';
import type { Logger } from 'pino';

export function requestLogger(logger: Logger) {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      
      logger.info({
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
        userAgent: req.get('user-agent')
      }, 'Request completed');
    });

    next();
  };
}
