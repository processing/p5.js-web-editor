import type { UserDocument } from '../user';

// to make the file a module and avoid the TypeScript error
export {};

/** Pending step-up verification code for accounts without a password */
interface StepUpCodeState {
  /** sha256 hex digest of the 6-digit code */
  hash: string;
  /** Expiry timestamp (ms) */
  expiresAt: number;
  /** Number of failed verification attempts */
  attempts: number;
  /** Timestamp (ms) the code was emailed, for resend rate-limiting */
  sentAt: number;
}

declare global {
  namespace Express {
    export interface User extends UserDocument {}

    // The project has no type definitions for express-session, so the parts
    // of req.session the server code relies on are declared here.
    export interface Request {
      session: {
        /** Timestamp (ms) of the last successful step-up re-authentication */
        stepUpAt?: number;
        stepUpCode?: StepUpCodeState;
      };
    }
  }
}
