import { Request, Response } from 'express';
import {
  ExpressErrorMiddlewareInterface,
  HttpError,
  InternalServerError,
  Middleware
} from 'routing-controllers';

@Middleware({ type: 'after' })
export class CustomErrorHandler implements ExpressErrorMiddlewareInterface {
  error(
    error: unknown,
    _request: Request,
    response: Response,
    next: (err?: unknown) => unknown
  ): void {
    console.error(error);
    if (error && error instanceof HttpError) {
      response.status(error.httpCode).json(error);
    } else {
      const internalServerError = new InternalServerError(`An unexpected error occurred.`);
      response.status(500).json(internalServerError);
    }
    next();
  }
}
