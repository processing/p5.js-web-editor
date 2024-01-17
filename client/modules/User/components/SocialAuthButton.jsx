import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { remSize } from '../../../theme';
import { GithubIcon, GoogleIcon } from '../../../common/icons';
import Button from '../../../common/Button';
import { unlinkService } from '../actions';
import { persistState } from '../../IDE/actions/project';

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

const servicesLabels = {
  github: 'GitHub',
  google: 'Google'
};

const StyledButton = styled(Button)`
  width: ${remSize(300)};
`;

function SocialAuthButton({ service, linkStyle, isConnected }) {
  const { t } = useTranslation();

  const ServiceIcon = icons[service];
  const serviceLabel = servicesLabels[service];
  const loginLabel = t('SocialAuthButton.Login', { serviceauth: serviceLabel });
  const connectLabel = t('SocialAuthButton.Connect', {
    serviceauth: serviceLabel
  });
  const unlinkLabel = t('SocialAuthButton.Unlink', {
    serviceauth: serviceLabel
  });
  const ariaLabel = t('SocialAuthButton.LogoARIA', { serviceauth: service });
  const dispatch = useDispatch();
  if (linkStyle) {
    if (isConnected) {
      return (
        <StyledButton
          iconBefore={<ServiceIcon aria-label={ariaLabel} />}
          onClick={() => {
            dispatch(unlinkService(service));
          }}
        >
          {unlinkLabel}
        </StyledButton>
      );
    }
    return (
      <StyledButton
        iconBefore={<ServiceIcon aria-label={ariaLabel} />}
        href={authUrls[service]}
        onClick={() => dispatch(persistState())}
      >
        {connectLabel}
      </StyledButton>
    );
  }
  return (
    <StyledButton
      iconBefore={<ServiceIcon aria-label={ariaLabel} />}
      href={authUrls[service]}
      onClick={() => dispatch(persistState())}
    >
      {loginLabel}
    </StyledButton>
  );
}

SocialAuthButton.services = services;

SocialAuthButton.propTypes = {
  service: PropTypes.oneOf(['github', 'google']).isRequired,
  linkStyle: PropTypes.bool,
  isConnected: PropTypes.bool
};

SocialAuthButton.defaultProps = {
  linkStyle: false,
  isConnected: false
};

export default SocialAuthButton;
