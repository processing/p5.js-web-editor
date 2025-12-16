import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { remSize } from '../../../theme';
import { GithubIcon, GoogleIcon } from '../../../common/icons';
import { Button } from '../../../common/Button';
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

export enum SocialAuthServices {
  github = 'github',
  google = 'google'
}

const servicesLabels = {
  github: 'GitHub',
  google: 'Google'
};

const StyledButton = styled(Button)`
  width: ${remSize(300)};
`;

export interface SocialAuthButtonProps {
  service: SocialAuthServices;
  linkStyle?: boolean;
  isConnected?: boolean;
}
export function SocialAuthButton({
  service,
  linkStyle = false,
  isConnected = false
}: SocialAuthButtonProps) {
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
