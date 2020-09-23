import Router from 'express';
import passport from 'passport';

const router = new Router();

router.get('/auth/github', passport.authenticate('github'));
router.get('/auth/github/callback', (req, res, next) => {
  passport.authenticate('github', { failureRedirect: '/login' }, (err, user) => {
    if (err) {
      // use query string param to show error;
      res.redirect('/account?error=github');
      return;
    }

    req.logIn(user, (loginErr) => {
      if (loginErr) {
        next(loginErr);
        return;
      }
      res.redirect('/');
    });
  })(req, res, next);
});

router.get('/auth/google', passport.authenticate('google'));
router.get('/auth/google/callback', (req, res, next) => {
  passport.authenticate('google', { failureRedirect: '/login' }, (err, user) => {
    if (err) {
      // use query string param to show error;
      res.redirect('/account?error=google');
      return;
    }

    req.logIn(user, (loginErr) => {
      if (loginErr) {
        next(loginErr);
        return;
      }
      res.redirect('/');
    });
  })(req, res, next);
});

export default router;
