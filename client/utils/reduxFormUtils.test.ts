import {
  validateLogin,
  validateSettings,
  validateSignup,
  validateNewPassword,
  validateResetPassword
} from './reduxFormUtils';

jest.mock('i18next', () => ({
  t: (key: string) => `translated(${key})`
}));

describe('reduxFormUtils', () => {
  describe('validateLogin', () => {
    it('returns errors when both username/email and password are missing', () => {
      const result = validateLogin({});
      expect(result).toEqual({
        email: 'translated(ReduxFormUtils.errorEmptyEmailorUserName)',
        password: 'translated(ReduxFormUtils.errorEmptyPassword)'
      });
    });

    it('returns no errors for valid login', () => {
      const result = validateLogin({
        email: 'user@example.com',
        password: 'password123'
      });
      expect(result).toEqual({});
    });
  });

  describe('validateSettings', () => {
    it('returns errors for invalid username and email', () => {
      const result = validateSettings({
        username: '!!!',
        email: 'bademail',
        currentPassword: '123456',
        newPassword: ''
      });
      expect(result).toMatchObject({
        username: 'translated(ReduxFormUtils.errorValidUsername)',
        email: 'translated(ReduxFormUtils.errorInvalidEmail)',
        newPassword: 'translated(ReduxFormUtils.errorNewPassword)'
      });
    });

    it('errors if newPassword is too short or same as currentPassword', () => {
      const result = validateSettings({
        username: 'gooduser',
        email: 'user@example.com',
        currentPassword: 'short',
        newPassword: 'short'
      });
      expect(result.newPassword).toBe(
        'translated(ReduxFormUtils.errorNewPasswordRepeat)'
      );
    });

    it('errors if newPassword is too short', () => {
      const result = validateSettings({
        username: 'gooduser',
        email: 'user@example.com',
        currentPassword: 'long enough',
        newPassword: 'short'
      });
      expect(result.newPassword).toBe(
        'translated(ReduxFormUtils.errorShortPassword)'
      );
    });

    it('errors if newPassword equals currentPassword', () => {
      const result = validateSettings({
        username: 'user',
        email: 'user@example.com',
        currentPassword: 'abc123',
        newPassword: 'abc123'
      });
      expect(result.newPassword).toBe(
        'translated(ReduxFormUtils.errorNewPasswordRepeat)'
      );
    });

    it('returns no errors for valid data', () => {
      const result = validateSettings({
        username: 'validuser',
        email: 'user@example.com',
        currentPassword: 'oldpass',
        newPassword: 'newpass123'
      });
      expect(result).toEqual({});
    });
  });

  describe('validateSignup', () => {
    it('returns errors for missing fields', () => {
      const result = validateSignup({});
      expect(result).toMatchObject({
        username: 'translated(ReduxFormUtils.errorEmptyUsername)',
        email: 'translated(ReduxFormUtils.errorEmptyEmail)',
        password: 'translated(ReduxFormUtils.errorEmptyPassword)',
        confirmPassword: 'translated(ReduxFormUtils.errorConfirmPassword)'
      });
    });

    it('returns error if password and confirmPassword don’t match', () => {
      const result = validateSignup({
        username: 'newuser',
        email: 'user@example.com',
        password: 'pass123',
        confirmPassword: 'different'
      });
      expect(result.confirmPassword).toBe(
        'translated(ReduxFormUtils.errorPasswordMismatch)'
      );
    });

    it('returns no errors for valid signup', () => {
      const result = validateSignup({
        username: 'user',
        email: 'user@example.com',
        password: 'securepass',
        confirmPassword: 'securepass'
      });
      expect(result).toEqual({});
    });
  });

  describe('validateNewPassword', () => {
    it('requires both password and confirmPassword', () => {
      const result = validateNewPassword({});
      expect(result).toMatchObject({
        password: 'translated(ReduxFormUtils.errorEmptyPassword)',
        confirmPassword: 'translated(ReduxFormUtils.errorConfirmPassword)'
      });
    });

    it('returns error if passwords do not match', () => {
      const result = validateNewPassword({
        password: 'abc123',
        confirmPassword: 'xyz456'
      });
      expect(result.confirmPassword).toBe(
        'translated(ReduxFormUtils.errorPasswordMismatch)'
      );
    });

    it('returns no errors if passwords match and are long enough', () => {
      const result = validateNewPassword({
        password: 'goodpass123',
        confirmPassword: 'goodpass123'
      });
      expect(result).toEqual({});
    });
  });

  describe('validateResetPassword', () => {
    it('returns error for missing email', () => {
      const result = validateResetPassword({});
      expect(result.email).toBe('translated(ReduxFormUtils.errorEmptyEmail)');
    });

    it('returns error for invalid email', () => {
      const result = validateResetPassword({ email: 'bademail' });
      expect(result.email).toBe('translated(ReduxFormUtils.errorInvalidEmail)');
    });

    it('returns no errors for valid email', () => {
      const result = validateResetPassword({ email: 'test@example.com' });
      expect(result).toEqual({});
    });
  });
});
