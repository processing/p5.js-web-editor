import { PublicUser, GenericResponseBody } from '.';

export interface CreateSessionRequestBody {
  username: string;
  password: string;
}

export type CreateSessionResponseBody = PublicUser | { message: string };

export type GetSessionResponseBody =
  | { user: null }
  | PublicUser
  | GenericResponseBody;

export type DestroySessionResponseBody = { success: boolean };
