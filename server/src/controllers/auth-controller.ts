import { Request, Response } from 'express';
import passport from 'passport';
import { Authorized, CurrentUser, Get, JsonController, UseBefore } from 'routing-controllers';
import { Service } from 'typedi';
import { config } from '../config';
import { AuthInfo } from '../dtos';
import { AuthService } from '../services/auth/auth-service';
import { IAuthController } from './interfaces/auth-interface';

@Service()
@JsonController('/auth')
export class AuthController implements IAuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/')
  @UseBefore((req: Request, res: Response, next: () => void) => {
    const { returnTo } = req.query;

    if (returnTo && req.session)
      req.session.returnTo = typeof returnTo === 'string' ? returnTo : undefined;

    passport.authenticate('discord')(req, res, next);
  })
  authenticate() {}

  @Get('/redirect')
  @UseBefore((req: Request, res: Response, next: () => void) => {
    const redirectUri =
      req.session?.returnTo ??
      `${process.env.NODE_ENV === 'production' ? '' : config.frontEndBaseUrl}/`;

    passport.authenticate('discord', (err: unknown, user: { token?: string }) => {
      if (err) {
        return res.redirect(redirectUri);
      }

      if (!user) {
        return res.redirect(redirectUri);
      }

      // Set JWT as httpOnly cookie
      if (user.token) {
        res.cookie('auth.jwt', user.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
      }

      res.redirect(redirectUri);
    })(req, res, next);
  })
  redirect() {}

  @Get('/logout')
  @UseBefore((_req: Request, res: Response) => {
    res.clearCookie('auth.jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    const redirectUri = process.env.NODE_ENV === 'production' ? '/' : `${config.frontEndBaseUrl}/`;
    res.redirect(redirectUri);
  })
  logout(): void {}

  @Get('/authorization')
  getAuthorization(@CurrentUser() user?: Express.User): Promise<AuthInfo> {
    return this.authService.getUserAuthInfo(user?.id);
  }

  @Get('/event_roles')
  @Authorized()
  getEventRoles(): Promise<string[]> {
    return Promise.resolve(config.eventRoles);
  }
}
