import { Request, Response } from 'express';
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import { Service } from 'typedi';
import { JWTService } from '../services/auth/jwt-service';

@Service()
@Middleware({ type: 'before', priority: 1 })
export class JWTMiddleware implements ExpressMiddlewareInterface {
  constructor(private readonly jwtService: JWTService) {}

  async use(request: Request, _response: Response, next: () => void): Promise<void> {
    const token = request.cookies['auth.jwt'];

    if (token) {
      try {
        const payload = this.jwtService.verifyToken(token);
        request.user = {
          id: payload.id,
          username: payload.username,
          expires: new Date(payload.expires * 1000)
        } satisfies Express.User;
      } catch {
        // Invalid or expired token, continue without user
      }
    }

    next();
  }
}
