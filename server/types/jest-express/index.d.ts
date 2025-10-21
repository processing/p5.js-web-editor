import type { Mock } from 'jest-express/lib/next';
import type { PublicUser, UserDocument } from '../user';

declare module 'jest-express/lib/request' {
  interface Request {
    user?: PublicUser | UserDocument;
    logIn: Mock;
  }
}
