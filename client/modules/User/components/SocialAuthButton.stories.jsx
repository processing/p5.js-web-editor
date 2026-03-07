import React from 'react';

import { SocialAuthButton, SocialAuthServices } from './SocialAuthButton';

export default {
  title: 'User/components/SocialAuthButton',
  component: SocialAuthButton
};

export const Github = () => (
  <SocialAuthButton service={SocialAuthServices.github}>
    Log in with Github
  </SocialAuthButton>
);

export const Google = () => (
  <SocialAuthButton service={SocialAuthServices.google}>
    Sign up with Google
  </SocialAuthButton>
);
