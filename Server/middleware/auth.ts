import { RequestHandler } from 'express';

import { getUserAuthInfo } from '../utils/auth';

export const isAdmin: RequestHandler = async (req, res, next) => {
  const authInfo = await getUserAuthInfo(req);
  if (authInfo.isAdmin) return next();
  return res.status(303).json('Forbidden');
};
