import React from 'react';

import SocialAuthButton from './SocialAuthButton';

export default {
  title: 'User/components/SocialAuthButton',
  component: SocialAuthButton
};

export const Github = () => (
  <SocialAuthButton service={SocialAuthButton.services.github}>
    Log in with Github
  </SocialAuthButton>
);

export const Google = () => (
  <SocialAuthButton service={SocialAuthButton.services.google}>
    Sign up with Google
  </SocialAuthButton>
);
