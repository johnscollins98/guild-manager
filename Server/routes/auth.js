const router = require('express').Router();
const passport = require('passport');

router.get('/', passport.authenticate('discord'));

router.get(
  '/redirect',
  passport.authenticate('discord', {
    failureRedirect: '/forbidden',
    successRedirect: '/',
  })
);

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

router.get('/authorization', async (req, res) => {
  if (req.user) {
    res.json(...(await getUserAuthInfo(req)));
  } else {
    res.status(403).json('Forbidden');
  }
});

module.exports = router;
