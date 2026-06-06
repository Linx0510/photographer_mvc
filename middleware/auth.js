function requireAdmin(req, res, next) {
  if (!req.session.user || !req.session.user.isAdmin) {
    req.session.flash = { type: 'error', message: 'Доступ запрещён.' };
    return res.redirect('/');
  }
  next();
}

module.exports = { requireAdmin };
