import type { UserDocument } from '../user';

// to make the file a module and avoid the TypeScript error
export {};

declare global {
  namespace Express {
    export interface User extends UserDocument {}
  }
}
