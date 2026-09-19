import type { NextFunction, Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import type { Options } from 'express-rate-limit';

/** Default sliding window for public auth endpoints: 15 minutes. */
export const DEFAULT_AUTH_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

/**
 * Conservative default for the public editor: enough for classroom logins
 * and debounced signup duplicate-checks, but still bounds brute-force/spam.
 */
export const DEFAULT_AUTH_RATE_LIMIT_MAX = 100;

/** Raised ceiling so existing test suites do not trip the limiter. */
export const TEST_AUTH_RATE_LIMIT_MAX = 10000;

const RATE_LIMIT_MESSAGE = 'Too many requests, please try again later.';

function readPositiveInt(value: string | undefined, fallback: number): number {
  if (value == null || value === '') {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return parsed;
}

function defaultMax(): number {
  const fallback =
    process.env.NODE_ENV === 'test'
      ? TEST_AUTH_RATE_LIMIT_MAX
      : DEFAULT_AUTH_RATE_LIMIT_MAX;
  return readPositiveInt(process.env.AUTH_RATE_LIMIT_MAX, fallback);
}

export const AUTH_RATE_LIMIT_WINDOW_MS = readPositiveInt(
  process.env.AUTH_RATE_LIMIT_WINDOW_MS,
  DEFAULT_AUTH_RATE_LIMIT_WINDOW_MS
);

export const AUTH_RATE_LIMIT_MAX = defaultMax();

export type AuthRateLimiterOptions = {
  windowMs?: number;
  limit?: number;
  store?: Options['store'];
  skip?: Options['skip'];
  validate?: Options['validate'];
};

function sendTooManyRequests(
  _req: Request,
  res: Response,
  _next: NextFunction,
  options: Options
): void {
  const retryAfterSeconds = Math.ceil(options.windowMs / 1000);
  res.set('Retry-After', String(retryAfterSeconds));
  res.status(429).json({ message: RATE_LIMIT_MESSAGE });
}

/**
 * Shared IP-based limiter for login, signup, and password-reset routes.
 * Override `limit` / `windowMs` in tests to assert the 429 threshold.
 */
export function createAuthRateLimiter(options: AuthRateLimiterOptions = {}) {
  return rateLimit({
    windowMs: options.windowMs ?? AUTH_RATE_LIMIT_WINDOW_MS,
    limit: options.limit ?? AUTH_RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    validate: options.validate ?? process.env.NODE_ENV !== 'test',
    handler: sendTooManyRequests,
    ...(options.store ? { store: options.store } : {}),
    ...(options.skip ? { skip: options.skip } : {})
  });
}

export const authRateLimiter = createAuthRateLimiter();
