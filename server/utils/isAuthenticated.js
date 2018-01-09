export default function isAuthenticated(req, res, next) {
  if (req.user) {
    next();
    return;
  }
  res.status(403).send({
    success: false,
    message: 'You must be logged in in order to perform the requested action.'
  });
}

