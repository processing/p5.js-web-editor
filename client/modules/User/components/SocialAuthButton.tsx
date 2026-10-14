import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { remSize } from '../../../theme';
import { GithubIcon, GoogleIcon } from '../../../common/icons';
import { Button } from '../../../common/Button';
import { unlinkService } from '../actions';
import { persistState } from '../../IDE/actions/project';
import { requestStepUp } from '../stepUp';
import type { RootState } from '../../../reducers';

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
  const authenticated = useSelector(
    (state: RootState) => !!(state.user as any).authenticated
  );
  const handleConnectClick = async (evt: React.MouseEvent) => {
    dispatch(persistState());
    // Logged-out sign-in stays untouched. While logged in this button links
    // the OAuth account, which needs a recent step-up first.
    if (!authenticated) {
      return;
    }
    evt.preventDefault();
    const verified = await requestStepUp();
    if (verified) {
      window.location.href = authUrls[service];
    }
  };
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
        onClick={handleConnectClick}
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
