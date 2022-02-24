import { RequestHandler } from 'express';

import { getUserAuthInfo } from '../utils/auth.utils';

export const isAdmin: RequestHandler = async (req, res, next) => {
  const authInfo = await getUserAuthInfo(req.user);
  if (authInfo.isAdmin) return next();
  return res.status(403).json('Forbidden');
};
