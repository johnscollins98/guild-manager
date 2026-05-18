import { sign, verify } from 'jsonwebtoken';
import { Service } from 'typedi';
import { config } from '../../config';

export interface JWTPayload {
  id: string;
  username: string;
  expires: number;
  iat: number;
}

@Service()
export class JWTService {
  /**
   * Sign a JWT token for a user
   */
  signToken(userId: string, username: string, expiresIn: number): string {
    const payload: Omit<JWTPayload, 'iat'> = {
      id: userId,
      username,
      expires: Date.now() + expiresIn * 1000
    };

    return sign(payload, config.sessionSecret!, {
      expiresIn: `${expiresIn.valueOf()}s`,
      algorithm: 'HS256'
    });
  }

  /**
   * Verify and decode a JWT token
   * Returns the payload if valid, throws if invalid
   */
  verifyToken(token: string): JWTPayload {
    return verify(token, config.sessionSecret!, {
      algorithms: ['HS256']
    }) as JWTPayload;
  }
}
