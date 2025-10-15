import { Document, Model, Types } from 'mongoose';
import { VirtualId, MongooseTimestamps } from './mongoose';
import { UserPreferences, CookieConsentOptions } from './userPreferences';
import { EmailConfirmationStates } from './email';
import { ApiKeyDocument } from './apiKey';

/** Full User interface */
export interface IUser extends VirtualId, MongooseTimestamps {
  name: string;
  username: string;
  password: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: number;
  verified?: string;
  verifiedToken?: string | null;
  verifiedTokenExpires?: number | null;
  github?: string;
  google?: string;
  email: string;
  tokens: { kind: string }[];
  apiKeys: ApiKeyDocument[];
  preferences: UserPreferences;
  totalSize: number;
  cookieConsent: CookieConsentOptions;
  banned: boolean;
  lastLoginTimestamp?: Date;
}

/** User object which can be exposed to the client */
export interface User extends IUser {}

/** Sanitised version of the user document without sensitive info */
export interface PublicUserDocument
  extends Pick<
    UserDocument,
    | 'email'
    | 'username'
    | 'preferences'
    | 'apiKeys'
    | 'verified'
    | 'id'
    | 'totalSize'
    | 'github'
    | 'google'
    | 'cookieConsent'
  > {}

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
