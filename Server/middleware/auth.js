const { getUserAuthInfo } = require('../utils/auth');

const isAdmin = async (req, res, next) => {
  const authInfo = await getUserAuthInfo(req);
  if (authInfo.isAdmin) return next();
  return res.status(303).json('Forbidden');
};

const isEventLeader = async (req, res, next) => {
  const authInfo = await getUserAuthInfo(req);
  if (authInfo.isEventLeader || authInfo.isAdmin) return next();
  return res.status(303).json('Forbidden');
};

exports.isAdmin = isAdmin;
exports.isEventLeader = isEventLeader;
