import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Button from '../../common/Button';
import { remSize } from '../../theme';

const ButtonWrapper = styled(Button)`
  width: ${remSize(48)};
  > svg {
    width: 100%;
    height: 100%;
  }
`;

const IconButton = (props) => {
  const { icon, ...otherProps } = props;
  const Icon = icon;

  return (
    <ButtonWrapper
      iconBefore={icon && <Icon />}
      kind={Button.kinds.inline}
      focusable="false"
      {...otherProps}
    />
  );
};

IconButton.propTypes = {
  icon: PropTypes.func
};

IconButton.defaultProps = {
  icon: null
};

export default IconButton;
