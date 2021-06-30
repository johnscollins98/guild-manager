const router = require('express').Router();
const passport = require('passport');
const { getUserAuthInfo } = require('../utils/auth');

router.get('/', passport.authenticate('discord'));

router.get(
  '/redirect',
  passport.authenticate('discord', {
    failureRedirect: `${process.env.FRONT_END_BASE_URL || ''}/`,
    successRedirect: `${process.env.FRONT_END_BASE_URL || ''}/`
  })
);

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

router.get('/authorization', async (req, res) => {
  res.json(JSON.stringify(await getUserAuthInfo(req)));
});

module.exports = router;
