/**
 * This is the base class for custom errors in
 * the application.
 */
export class ApplicationError extends Error {
  constructor(message) {
    super();
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
    this.name = 'ApplicationError';
    this.message = message;
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
  return class extends ApplicationError {
    constructor(...params) {
      super(...params);

      this.name = name;
    }
  };
}
