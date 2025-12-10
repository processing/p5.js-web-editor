import { Document, Model, Types } from 'mongoose';
import { VirtualId, MongooseTimestamps } from './mongoose';
import { UserPreferences, CookieConsentOptions } from './userPreferences';
import { EmailConfirmationStates } from './email';
import { ApiKeyDocument, SanitisedApiKey } from './apiKey';
import { Error, GenericResponseBody, RouteParam } from './express';

// -------- MONGOOSE --------
/** Full User interface */
export interface IUser extends VirtualId, MongooseTimestamps {
  name: string;
  username: string;
  password?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: number;
  verified?: string;
  verifiedToken?: string | null;
  verifiedTokenExpires?: number | null;
  github?: string;
  google?: string;
  email: string;
  tokens: { kind: string }[];
  apiKeys: Types.DocumentArray<ApiKeyDocument>;
  preferences: UserPreferences;
  totalSize: number;
  cookieConsent: CookieConsentOptions;
  banned: boolean;
  lastLoginTimestamp?: Date;
}

/** User object which can be exposed to the client */
export interface User extends IUser {}

/** Sanitised version of the user document without sensitive info */
export interface PublicUser
  extends Pick<
    UserDocument,
    | 'email'
    | 'username'
    | 'preferences'
    | 'verified'
    | 'id'
    | 'totalSize'
    | 'github'
    | 'google'
    | 'cookieConsent'
    | 'totalSize'
  > {
  /** Can contain either raw ApiKeyDocuments (server side) or SanitisedApiKeys (client side) */
  apiKeys: SanitisedApiKey[];
}

/** Mongoose document object for User */
export interface UserDocument
  extends IUser,
    Omit<Document<Types.ObjectId>, 'id'> {
  comparePassword(candidatePassword: string): Promise<boolean>;
  findMatchingKey(
    candidateKey: string
  ): Promise<{ isMatch: boolean; keyDocument: ApiKeyDocument | null }>;
}

/** Mongoose model for User */
export interface UserModel extends Model<UserDocument> {
  findByEmail(email: string | string[]): Promise<UserDocument | null>;
  findAllByEmails(emails: string[]): Promise<UserDocument[] | null>;
  findByUsername(
    username: string,
    options?: { caseInsensitive: boolean }
  ): Promise<UserDocument | null>;
  findByEmailOrUsername(
    value: string,
    options?: { caseInsensitive: boolean; valueType: 'email' | 'username' }
  ): Promise<UserDocument | null>;
  findByEmailAndUsername(
    email: string,
    username: string
  ): Promise<UserDocument | null>;

  EmailConfirmation(): typeof EmailConfirmationStates;
}

// -------- API --------
/**
 * Response body used for User related routes
 * Contains either the Public (sanitised) User or an Error
 */
export type PublicUserOrError = PublicUser | Error;

/**
 * Note: This type should probably be updated to be removed in the future and use just PublicUserOrError
 *   - Contains either a GenericResponseBody for when there is no user found or attached to a request
 *   - Or a PublicUserOrError resulting from calling the `saveUser` helper.
 */
export type PublicUserOrErrorOrGeneric =
  | PublicUserOrError
  | GenericResponseBody;

/** userController.updateSettings - Request */
export interface UpdateSettingsRequestBody {
  username: string;
  email: string;
  newPassword?: string;
  currentPassword?: string;
}

/**
 * userContoller.unlinkGithub & userContoller.unlinkGoogle - Response
 *   - If user is not logged in, a GenericResponseBody with 404 is returned
 *   - If user is logged in, PublicUserOrError is returned
 */
export type UnlinkThirdPartyResponseBody = PublicUserOrErrorOrGeneric;

/** userController.resetPasswordInitiate - Request */
export interface ResetPasswordInitiateRequestBody {
  email: string;
}

/** userContoller.validateResetPasswordToken & userController.updatePassword - Request */
export interface ResetOrUpdatePasswordRequestParams extends RouteParam {
  token: string;
}
/** userController.updatePassword - Request */
export interface UpdatePasswordRequestBody {
  password: string;
}
/** userController.createUser - Request */
export interface CreateUserRequestBody {
  username: string;
  email: string;
  password: string;
}
/** userController.duplicateUserCheck - Query */
export interface DuplicateUserCheckQuery {
  // eslint-disable-next-line camelcase
  check_type: 'email' | 'username';
  email?: string;
  username?: string;
}
/** userController.verifyEmail - Query */
export interface VerifyEmailQuery {
  t: string;
}
