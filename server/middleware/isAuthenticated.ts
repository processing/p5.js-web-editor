import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';

/** Middleware function to check if a request is authenticated prior to passing onto routes requiring user to be logged in */
export function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
): asserts req is AuthenticatedRequest {
  if (req.user) {
    next();
    return;
  }
  res.status(403).send({
    success: false,
    message: 'You must be logged in in order to perform the requested action.'
  });
}
