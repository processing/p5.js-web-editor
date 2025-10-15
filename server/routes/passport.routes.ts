import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';

const router = Router();

const authenticateOAuth = (service: string) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate(
    service,
    { failureRedirect: '/login' },
    (err: any, user: any) => {
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
    }
  )(req, res, next);
};

router.get('/auth/github', passport.authenticate('github'));
router.get('/auth/github/callback', authenticateOAuth('github'));

router.get('/auth/google', passport.authenticate('google'));
router.get('/auth/google/callback', authenticateOAuth('google'));

// eslint-disable-next-line import/no-default-export
export default router;
