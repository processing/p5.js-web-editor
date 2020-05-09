import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

import { remSize } from '../../../theme';

import Button from '../../../common/Button';

const authUrls = {
  Github: '/auth-github',
  Google: '/auth/google/'
};

const labels = {
  Github: 'Login with GitHub',
  Google: 'Login with Google'
};

const services = {
  Github: 'github',
  Google: 'google'
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
  service: PropTypes.oneOf(['Github', 'Google']).isRequired
};

export default SocialAuthButton;
