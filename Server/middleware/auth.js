const authenticate = async (req, res, next) => {
  const authInfo = await getUserAuthInfo(req);
  if (!!authInfo.authorized) return next()
  return res.redirect(303, '/forbidden')
}

exports.authenticate = authenticate