// This file declares shared types between the client & server
// Types should be defined in their own portions of the codebase and exported here.

// SERVER SHARED TYPES:
export type {
  SanitisedApiKey,
  IApiKey as ApiKey,
  ApiKeyResponseOrError,
  ApiKeyResponse,
  CreateApiKeyRequestBody,
  RemoveApiKeyRequestParams
} from '../../server/types/apiKey';

export * from '../../server/types/email';

export type { Error, GenericResponseBody } from '../../server/types/express';

export type {
  User,
  PublicUser,
  PublicUserOrError,
  PublicUserOrErrorOrGeneric,
  UpdateSettingsRequestBody,
  UnlinkThirdPartyResponseBody,
  ResetPasswordInitiateRequestBody,
  ResetOrUpdatePasswordRequestParams,
  UpdatePasswordRequestBody,
  CreateUserRequestBody,
  DuplicateUserCheckQuery,
  VerifyEmailQuery
} from '../../server/types/user';

export * from '../../server/types/userPreferences';
