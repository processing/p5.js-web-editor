import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import i18n from 'i18next';
import { withTranslation } from 'react-i18next';

import { remSize } from '../../../theme';

import { GithubIcon, GoogleIcon } from '../../../common/icons';
import Button from '../../../common/Button';

const authUrls = {
  github: '/auth/github',
  google: '/auth/google'
};

const icons = {
  github: GithubIcon,
  google: GoogleIcon
};

const services = {
  github: 'github',
  google: 'google'
};

const StyledButton = styled(Button)`
  width: ${remSize(300)};
`;

function SocialAuthButton({ service, t }) {
  const ServiceIcon = icons[service];
  const labels = {
    github: t('Login.LoginGithub'),
    google: t('Login.LoginGoogle')
  };
  return (
    <StyledButton
      // iconBefore={<ServiceIcon aria-label={`${service} logo`} />}
      iconBefore={<ServiceIcon aria-label={t('Login.GithubLogoARIA', { serviceauth: service })} />}
      href={authUrls[service]}
    >
      {labels[service]}
    </StyledButton>
  );
}

SocialAuthButton.services = services;

SocialAuthButton.propTypes = {
  service: PropTypes.oneOf(['github', 'google']).isRequired,
  t: PropTypes.func.isRequired
};

const SocialAuthButtonPublic = withTranslation()(SocialAuthButton);
SocialAuthButtonPublic.services = services;
export default SocialAuthButtonPublic;
