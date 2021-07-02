const router = require('express').Router();
import { Request, Response } from 'express';
import passport from 'passport';
import { getUserAuthInfo } from '../utils/auth';

router.get('/', passport.authenticate('discord'));

router.get(
  '/redirect',
  passport.authenticate('discord', {
    failureRedirect: `${process.env.FRONT_END_BASE_URL || ''}/`,
    successRedirect: `${process.env.FRONT_END_BASE_URL || ''}/`
  })
);

router.get('/logout', (req: Request, res: Response) => {
  req.logout();
  res.redirect('/');
});

router.get('/authorization', async (req: Request, res: Response) => {
  res.json(JSON.stringify(await getUserAuthInfo(req)));
});

module.exports = router;
