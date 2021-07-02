import { RequestHandler } from 'express';

const { getUserAuthInfo } = require('../utils/auth');

export const isAdmin: RequestHandler = async (req, res, next) => {
  const authInfo = await getUserAuthInfo(req);
  if (authInfo.isAdmin) return next();
  return res.status(303).json('Forbidden');
};

export const isEventLeader: RequestHandler = async (req, res, next) => {
  const authInfo = await getUserAuthInfo(req);
  if (authInfo.isEventLeader || authInfo.isAdmin) return next();
  return res.status(303).json('Forbidden');
};

exports.isAdmin = isAdmin;
exports.isEventLeader = isEventLeader;
