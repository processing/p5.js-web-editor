import Router from 'express';
import passport from 'passport';

const router = new Router();

const authenticateOAuth = (service) => (req, res, next) => {
  passport.authenticate(service, { failureRedirect: '/login' }, (err, user) => {
    if (err) {
      // use query string param to show error;
      res.redirect(`/account?error=${service}`);
      return;
    }

    if (!user) {
      res.redirect(`/account?error=${service}NoUser`);
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
};

router.get('/auth/github', passport.authenticate('github'));
router.get('/auth/github/callback', authenticateOAuth('github'));

router.get('/auth/google', passport.authenticate('google'));
router.get('/auth/google/callback', authenticateOAuth('google'));

export default router;
