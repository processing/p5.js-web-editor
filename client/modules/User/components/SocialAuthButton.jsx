import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

import { remSize } from '../../../theme';

import { GithubIcon, GoogleIcon } from '../../../common/Icons';
import Button from '../../../common/Button';

const authUrls = {
  github: '/auth/github',
  google: '/auth/google'
};

const labels = {
  github: 'Login with GitHub',
  google: 'Login with Google'
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

function SocialAuthButton({ service }) {
  const ServiceIcon = icons[service];
  return (
    <StyledButton
      iconBefore={<ServiceIcon aria-label={`${service} logo`} />}
      href={authUrls[service]}
    >
      {labels[service]}
    </StyledButton>
  );
}

SocialAuthButton.services = services;

SocialAuthButton.propTypes = {
  service: PropTypes.oneOf(['github', 'google']).isRequired
};

export default SocialAuthButton;
