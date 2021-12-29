import express from 'express';
import { Request, Response } from 'express';
import passport from 'passport';
import { config } from '../config';
import { getUserAuthInfo } from '../utils/auth';

const router = express.Router();

router.get('/', passport.authenticate('discord'));

router.get(
  '/redirect',
  passport.authenticate('discord', {
    failureRedirect: `${config.frontEndBaseUrl}/`,
    successRedirect: `${config.frontEndBaseUrl}/`
  })
);

router.get('/logout', (req: Request, res: Response) => {
  req.logout();
  res.redirect('/');
});

router.get('/authorization', async (req: Request, res: Response) => {
  res.set('Cache-control', 'no-store');
  res.json(JSON.stringify(await getUserAuthInfo(req)));
});

router.get('/admin_roles', (_req: Request, res: Response) => {
  res.json(config.adminRoles);
});

router.get('/event_roles', (_req: Request, res: Response) => {
  const eventLeaders = config.adminRoles.concat(config.eventRoles);
  res.json(eventLeaders);
})

export default router;
