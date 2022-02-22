import { RequestHandler } from 'express';

export const setCache: RequestHandler = function (req, res, next) {
  const period = 30; 

  if (req.method == 'GET') {
    res.set('Cache-control', `public, max-age=${period}`)
  } else {
    // for the other requests set strict no caching parameters
    res.set('Cache-control', `no-store`)
  }

  next()
}