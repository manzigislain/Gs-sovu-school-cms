function requireAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  req.flash('error', 'Please login to access the admin panel.');
  res.redirect('/admin/login');
}

function requireAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') return next();
  res.status(403).render('admin/error', { title: 'Access Denied', message: 'You do not have permission.', user: req.session.user });
}

module.exports = { requireAuth, requireAdmin };
