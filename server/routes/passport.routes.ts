import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { UserDocument } from '../types';
import { hasRecentStepUp } from '../middleware/requireStepUp';

const router = Router();

/**
 * Visiting /auth/github or /auth/google while logged in links the OAuth
 * account to the current user, which is a sensitive action: without this
 * check, anyone holding a stolen session could attach their own OAuth
 * account and keep access permanently. Plain sign-in (no session) stays open.
 */
const requireStepUpForLinking = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user && !hasRecentStepUp(req)) {
    res.redirect('/account?error=stepUpRequired');
    return;
  }
  next();
};

const authenticateOAuth = (service: string) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate(
    service,
    { failureRedirect: '/login' },
    (err: unknown, user: UserDocument) => {
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

router.get(
  '/auth/github',
  requireStepUpForLinking,
  passport.authenticate('github')
);
router.get('/auth/github/callback', authenticateOAuth('github'));

router.get(
  '/auth/google',
  requireStepUpForLinking,
  passport.authenticate('google')
);
router.get('/auth/google/callback', authenticateOAuth('google'));

// eslint-disable-next-line import/no-default-export
export default router;
