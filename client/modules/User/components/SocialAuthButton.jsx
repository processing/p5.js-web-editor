import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

import { remSize } from '../../../theme';

import Button from '../../../common/Button';

const authUrls = {
  github: '/auth-github',
  google: '/auth/google/'
};

const labels = {
  github: 'Login with GitHub',
  google: 'Login with Google'
};

const services = {
  github: 'github',
  google: 'google'
};

const StyledButton = styled(Button)`
  width: ${remSize(300)};
`;

function SocialAuthButton({ service }) {
  return (
    <StyledButton
      iconBeforeName={Button.iconNames[service]}
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
