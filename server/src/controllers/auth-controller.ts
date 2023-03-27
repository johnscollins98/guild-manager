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
import { AuthService } from '../services/auth/auth-service';

@Service()
@JsonController('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/')
  @UseBefore(passport.authenticate('discord'))
  authenticate() {}

  @Get('/redirect')
  @UseBefore(
    passport.authenticate('discord', {
      failureRedirect: `${process.env.NODE_ENV === 'production' ? '' : config.frontEndBaseUrl}/`,
      successRedirect: `${process.env.NODE_ENV === 'production' ? '' : config.frontEndBaseUrl}/`
    })
  )
  redirect() {}

  @Get('/logout')
  logout(@Req() req: Request, @Res() res: Response) {
    req.logout(() => {
      res.redirect('/');
    });
  }

  @Get('/authorization')
  @Header('Cache-control', 'no-store')
  getAuthorization(@CurrentUser() user: Express.User) {
    return this.authService.getUserAuthInfo(user);
  }

  @Get('/admin_roles')
  @Authorized()
  getAdminRoles() {
    return config.adminRoles;
  }

  @Get('/event_roles')
  @Authorized()
  getEventRoles() {
    return config.eventRoles.concat(config.adminRoles);
  }
}

