import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

import { remSize } from '../../../theme';

import Icons from '../../../common/Icons';
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
  github: Icons.Github,
  google: Icons.Google
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
      href={authUrls[service]}
    >
      <ServiceIcon aria-label={`${service} logo`} />
      <span>{labels[service]}</span>
    </StyledButton>
  );
}

SocialAuthButton.services = services;

SocialAuthButton.propTypes = {
  service: PropTypes.oneOf(['github', 'google']).isRequired
};

export default SocialAuthButton;
