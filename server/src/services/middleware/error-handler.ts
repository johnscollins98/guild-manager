import { Request, Response } from 'express';
import { ExpressErrorMiddlewareInterface, Middleware } from 'routing-controllers';

@Middleware({ type: 'after' })
export class ErrorCatcherMiddleware implements ExpressErrorMiddlewareInterface {
  error(error: unknown, _req: Request, _res: Response, _next: () => void) {
    if (error) {
      if (_res.headersSent) {
        return _res.end();
      }

      return _res.json(error);
    }

    return _next();
  }
}
