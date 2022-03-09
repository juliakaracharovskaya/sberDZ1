const checkAuth = (req, res, next) => {
  const currentUser = req.session?.user

  if (currentUser) {
    return next()
  }

  return res.redirect('/auth/signup')
}

module.exports = {
  checkAuth,
}
