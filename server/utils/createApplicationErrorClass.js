/**
 * This is the base class for custom errors in
 * the application.
 */
export class ApplicationError extends Error {
  constructor(message, extra) {
    super();
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
    this.name = 'ApplicationError';
    this.message = message;
    if (extra) this.extra = extra;
  }
}

/**
 * Create a new custom error class e.g.
 *   const UserNotFoundError = createApplicationErrorClass('UserNotFoundError');
 *
 * // Later
 *  throw new UserNotFoundError(`user ${user.name} not found`);
 *
 */
export default function createApplicationErrorClass(name) {
  const CustomError = class extends ApplicationError {
    constructor(...params) {
      super(...params);

      this.name = name;
    }
  };

  return CustomError;
}
