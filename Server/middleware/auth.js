const { getUserAuthInfo } = require('../utils/auth');

const isAdmin = async (req, res, next) => {
  const authInfo = await getUserAuthInfo(req);
  if (!!authInfo.isAdmin) return next();
  return res.redirect(303, '/forbidden');
};

const isEventLeader = async (req, res, next) => {
  const authInfo = await getUserAuthInfo(req);
  if (!!authInfo.isEventLeader) return next();
  return res.redirect(303, '/forbidden');
};

exports.isAdmin = isAdmin;
exports.isEventLeader = isEventLeader;
