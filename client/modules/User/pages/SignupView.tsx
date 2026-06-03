import React from 'react';
import { LoginView } from './LoginView';

// All accounts are managed by OpenProcessing now. Signing up and signing in are
// the same flow (the OpenProcessing popup handles both creating a new account
// and logging into an existing one), so /signup renders the same page as /login.
export function SignupView() {
  return <LoginView />;
}
