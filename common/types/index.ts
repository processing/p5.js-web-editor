// Shared types for the editor client.
//
// These used to be re-exported from `server/types/*`, but after the
// OpenProcessing migration the editor server no longer owns user/auth/email
// domain types (and those files were Mongoose-coupled). The client-facing
// types now live here directly, free of any database dependency.

// -------- Generic response shapes --------
/** Simple error object returned by API requests. */
export interface Error {
  error: string | unknown;
}

/** Simple response object with a success status and optional message. */
export interface GenericResponseBody {
  success: boolean;
  message?: string;
}

// -------- Editor preferences --------
export enum AppThemeOptions {
  LIGHT = 'light',
  DARK = 'dark',
  CONTRAST = 'contrast'
}

export enum CookieConsentOptions {
  NONE = 'none',
  ESSENTIAL = 'essential',
  ALL = 'all'
}

export interface UserPreferences {
  fontSize: number;
  lineNumbers: boolean;
  indentationAmount: number;
  isTabIndent: boolean;
  autosave: boolean;
  linewrap: boolean;
  lintWarning: boolean;
  textOutput: boolean;
  gridOutput: boolean;
  theme: AppThemeOptions;
  autorefresh: boolean;
  language: string;
  autocloseBracketsQuotes: boolean;
  autocompleteHinter: boolean;
}

/** Body for a preferences update (partial patch). */
export interface UpdatePreferencesRequestBody {
  preferences: Partial<UserPreferences>;
}

// -------- API keys (personal access tokens) --------
/** API key as exposed to the client (no hashed secret). */
export interface SanitisedApiKey {
  id: string;
  label: string;
  lastUsedAt?: Date;
  createdAt?: Date;
  token?: string;
}

/** createApiKey - Request */
export interface CreateApiKeyRequestBody {
  label: string;
}

/** removeApiKey - Request */
export interface RemoveApiKeyRequestParams {
  keyId: string;
}

// -------- User --------
/** User object exposed to the client (no sensitive fields). */
export interface PublicUser {
  email: string;
  username: string;
  preferences: UserPreferences;
  verified?: string;
  id: string;
  totalSize: number;
  github?: string;
  google?: string;
  cookieConsent: CookieConsentOptions;
  apiKeys: SanitisedApiKey[];
  totalSketches?: number;
}

export type PublicUserOrError = PublicUser | Error;

export type PublicUserOrErrorOrGeneric =
  | PublicUserOrError
  | GenericResponseBody;

/** updateSettings - Request */
export interface UpdateSettingsRequestBody {
  username: string;
  email: string;
  newPassword?: string;
  currentPassword?: string;
}

/** resetPasswordInitiate - Request */
export interface ResetPasswordInitiateRequestBody {
  email: string;
}

/** validateResetPasswordToken & updatePassword - Route params */
export interface ResetOrUpdatePasswordRequestParams {
  token: string;
}

/** updatePassword - Request */
export interface UpdatePasswordRequestBody {
  password: string;
}

/** createUser - Request */
export interface CreateUserRequestBody {
  username: string;
  email: string;
  password: string;
}

/** verifyEmail - Query */
export interface VerifyEmailQuery {
  t: string;
}
