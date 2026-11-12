import { Request, Response, NextFunction } from 'express';

/** How long a successful step-up re-authentication stays valid */
export const STEP_UP_WINDOW_MS = 10 * 60 * 1000;

/**
 * Whether the session completed a step-up re-authentication recently enough
 * to perform a sensitive action. The marker lives in the server-side session
 * store, so it cannot be forged by a client.
 */
export function hasRecentStepUp(req: Request): boolean {
  const stepUpAt = req.session?.stepUpAt;
  return (
    typeof stepUpAt === 'number' && Date.now() - stepUpAt < STEP_UP_WINDOW_MS
  );
}

/**
 * Middleware guarding sensitive actions (credential changes, OAuth
 * unlinking, API key creation). A session alone is not enough: the user must
 * have recently re-authenticated via POST /account/step-up. Clients receiving
 * this 403 should prompt for step-up and retry the original request.
 */
export function requireStepUp(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (hasRecentStepUp(req)) {
    next();
    return;
  }
  res.status(403).json({ error: 'step_up_required' });
}
