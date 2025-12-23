import { Types } from 'mongoose';
import { PublicUser, User, UserDocument, UserPreferences } from '../../types';
import {
  CookieConsentOptions,
  ApiKeyDocument,
  AppThemeOptions
} from '../../types';

/** Mock user preferences for testing. Matches mongoose defaults in User model */
export const mockUserPreferences: UserPreferences = {
  fontSize: 18,
  lineNumbers: true,
  indentationAmount: 2,
  isTabIndent: false,
  autosave: true,
  linewrap: true,
  lintWarning: false,
  textOutput: false,
  gridOutput: false,
  theme: AppThemeOptions.LIGHT,
  autorefresh: false,
  language: 'en-GB',
  autocloseBracketsQuotes: true,
  autocompleteHinter: false
};

/** Mock sanitised user for testing */
export const mockBaseUserSanitised: PublicUser = {
  email: 'test@example.com',
  username: 'tester',
  preferences: mockUserPreferences,
  apiKeys: [],
  verified: 'verified',
  id: 'abc123',
  totalSize: 42,
  cookieConsent: CookieConsentOptions.NONE,
  google: 'user@gmail.com',
  github: 'user123'
};

/** Mock full user for testing. createdAt is omitted to simplify jest timers where possible */
export const mockBaseUserFull: Omit<User, 'createdAt'> = {
  ...mockBaseUserSanitised,
  name: 'test user',
  apiKeys: ([] as unknown) as Types.DocumentArray<ApiKeyDocument>,
  tokens: [],
  password: 'abweorij',
  resetPasswordToken: '1i14ij23',
  banned: false
};

/**
 * Helper function to make mock user document / object for tests
 *   - Does not attach any document methods
 * @param unSanitised - use the entire user type, including sensitive fields
 * @param overrides - any overrides on the default mocks --> for clearest tests, always define the properties expected to change
 * @returns
 */
export function createMockUser(
  overrides: Partial<UserDocument> = {},
  unSanitised: boolean = false
): PublicUser | UserDocument {
  if (unSanitised) {
    return {
      ...mockBaseUserFull,
      ...overrides
    } as UserDocument;
  }
  return {
    ...mockBaseUserSanitised,
    ...overrides
  } as PublicUser;
}
