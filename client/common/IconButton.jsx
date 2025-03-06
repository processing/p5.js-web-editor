import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Button from './Button';
import { remSize } from '../theme';

const ButtonWrapper = styled(Button)`
  width: ${remSize(48)};
  > svg {
    width: 100%;
    height: 100%;
  }
`;

const IconButton = (props) => {
  const { icon, ariaLabel, ...otherProps } = props;
  const Icon = icon;

  return (
    <ButtonWrapper
      iconBefore={icon && <Icon />}
      iconOnly
      display={Button.displays.inline}
      focusable="false"
      aria-label={ariaLabel}
      {...otherProps}
    />
  );
};

IconButton.propTypes = {
  icon: PropTypes.func,
  ariaLabel: PropTypes.string
};

IconButton.defaultProps = {
  icon: null,
  ariaLabel: ''
};

export default IconButton;
