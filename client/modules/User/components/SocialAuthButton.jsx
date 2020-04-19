import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

import { remSize, prop } from '../../../theme';

import Button from '../../../common/Button';
import Icon from '../../../common/Icon';

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

  > * + * {
    margin-left: ${remSize(10)};
  }
`;

const StyledIcon = styled(Icon)`
  width: ${remSize(32)};
  height: ${remSize(32)};
`;

function SocialAuthButton({ service }) {
  return (
    <StyledButton
      href={authUrls[service]}
    >
      <StyledIcon name={Icon.names[service]} />
      <span>{labels[service]}</span>
    </StyledButton>
  );
}

SocialAuthButton.services = services;

SocialAuthButton.propTypes = {
  service: PropTypes.oneOf(['github', 'google']).isRequired
};

export default SocialAuthButton;
