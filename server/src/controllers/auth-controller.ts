import { Request, Response } from 'express';
import passport from 'passport';
import {
  Authorized,
  CurrentUser,
  Get,
  Header,
  JsonController,
  Req,
  Res,
  UseBefore
} from 'routing-controllers';
import { Service } from 'typedi';
import { config } from '../config';
import { AuthInfo } from '../models';
import { AuthService } from '../services/auth/auth-service';
import { IAuthController } from './interfaces/auth-interface';

@Service()
@JsonController('/auth')
export class AuthController implements IAuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/')
  @UseBefore(passport.authenticate('discord'))
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  authenticate() {}

  @Get('/redirect')
  @UseBefore(
    passport.authenticate('discord', {
      failureRedirect: `${process.env.NODE_ENV === 'production' ? '' : config.frontEndBaseUrl}/`,
      successRedirect: `${process.env.NODE_ENV === 'production' ? '' : config.frontEndBaseUrl}/`
    })
  )
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  redirect() {}

  @Get('/logout')
  logout(@Req() req: Request, @Res() res: Response): void {
    req.logout(() => {
      res.redirect('/');
    });
  }

  @Get('/authorization')
  @Header('Cache-control', 'no-store')
  getAuthorization(@CurrentUser() user?: Express.User): Promise<AuthInfo> {
    return this.authService.getUserAuthInfo(user);
  }

  @Get('/admin_roles')
  @Authorized()
  getAdminRoles(): Promise<string[]> {
    return Promise.resolve(config.adminRoles);
  }

  @Get('/event_roles')
  @Authorized()
  getEventRoles(): Promise<string[]> {
    return Promise.resolve(config.eventRoles.concat(config.adminRoles));
  }
}
