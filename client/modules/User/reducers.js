import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  authenticated: false,
  resetPasswordInitiate: false,
  resetPasswordInvalid: false,
  emailVerificationInitiate: false,
  emailVerificationTokenState: null,
  cookieConsent: false
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    authUser: (state, action) => {
      const { user } = action.payload;
      return {
        ...user,
        authenticated: true
      };
    },
    unauthUser: (state, action) => ({
      authenticated: false
    }),
    authError: (state, action) => ({
      authenticated: false
    }),
    resetPasswordInitiate: (state, action) => ({
      ...state,
      resetPasswordInitiate: true
    }),
    resetPasswordReset: (state, action) => ({
      ...state,
      resetPasswordInitiate: false
    }),
    invalidResetPasswordToken: (state, action) => ({
      ...state,
      resetPasswordInvalid: true
    }),
    emailVerificationInitiate: (state, action) => ({
      ...state,
      emailVerificationInitiate: true
    }),
    emailVerificationVerify: (state, action) => ({
      ...state,
      emailVerificationTokenState: 'checking'
    }),
    emailVerificationVerified: (state, action) => ({
      ...state,
      emailVerificationTokenState: 'verified'
    }),
    emailVerificationInvalid: (state, action) => ({
      ...state,
      emailVerificationTokenState: 'invalid'
    }),
    settingsUpdated: (state, action) => ({
      ...state,
      ...action.payload.user
    }),
    apiKeyRemoved: (state, action) => ({
      ...state,
      ...action.payload.user
    }),
    apiKeyCreated: (state, action) => ({
      ...state,
      ...action.payload.user
    }),
    setCookieConsent: (state, action) => ({
      ...state,
      cookieConsent: action.payload.cookieConsent
    })
  }
});

export const userActions = userSlice.actions;

export default userSlice.reducer;
