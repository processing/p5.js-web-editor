import React, { ComponentType } from 'react';
import styled from 'styled-components';
import { Button, ButtonProps, ButtonDisplays } from './Button';
import { remSize } from '../theme';

const ButtonWrapper = styled(Button)`
  width: ${remSize(48)};
  > svg {
    width: 100%;
    height: 100%;
  }
`;

export interface IconButtonProps
  extends Omit<ButtonProps, 'iconBefore' | 'display' | 'focusable'> {
  icon?: ComponentType<{ 'aria-label'?: string }>;
  href?: string;
  to?: string;
  onClick?: () => void;
}

export const IconButton = ({ icon: Icon, ...otherProps }: IconButtonProps) => (
  <ButtonWrapper
    iconBefore={Icon ? <Icon /> : undefined}
    iconOnly
    display={ButtonDisplays.INLINE}
    focusable={false}
    {...otherProps}
  />
);
