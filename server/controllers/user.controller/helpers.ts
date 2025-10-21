import crypto from 'crypto';
import type { Response } from 'express';
import { User } from '../../models/user';
import { PublicUser, UserDocument } from '../../types';

/**
 * Sanitise user objects to remove sensitive fields
 * @param user
 * @returns Sanitised user
 */
export function userResponse(user: PublicUser | UserDocument): PublicUser {
  return {
    email: user.email,
    username: user.username,
    preferences: user.preferences,
    apiKeys: user.apiKeys,
    verified: user.verified,
    id: user.id,
    totalSize: user.totalSize,
    github: user.github,
    google: user.google,
    cookieConsent: user.cookieConsent
  };
}

/**
 * Create a new verification token.
 * Note: can be done synchronously - https://nodejs.org/api/crypto.html#cryptorandombytessize-callback
 * @return Promise<string>
 */
export async function generateToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(20, (err, buf) => {
      if (err) {
        reject(err);
      } else {
        const token = buf.toString('hex');
        resolve(token);
      }
    });
  });
}

/**
 * Updates the user object and sets the response.
 * Response is of type PublicUserOrError
 *   - The sanitised user or a 500 error.
 * @param res
 * @param user
 */
export async function saveUser(res: Response, user: UserDocument) {
  try {
    await user.save();
    res.json(userResponse(user));
  } catch (error) {
    res.status(500).json({ error });
  }
}

/**
 * Helper used in other controllers to check if user by username exists.
 */
export async function userExists(username: string): Promise<boolean> {
  const user = await User.findByUsername(username);
  return user != null;
}
