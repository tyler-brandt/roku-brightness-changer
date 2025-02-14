import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggerMiddlware implements NestMiddleware {
  private readonly logger = new Logger(RequestLoggerMiddlware.name);

  // constructor(private readonly logger: LoggerService) {}
  use(req: Request, res: Response, next: NextFunction) {
    const now = Date.now();

    this.logger.log(`=> ${req.method} ${req.originalUrl}`);
    next();
    this.logger.log(`<= ${req.method} ${req.originalUrl} FINISHED in: ${Date.now() - now}ms`);
  }
}
