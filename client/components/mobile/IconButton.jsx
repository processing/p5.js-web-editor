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

const IconButton = props => (<ButtonWrapper
  iconBefore={props.children}
  kind={Button.kinds.inline}
  {...{ ...props, children: null }}
/>);

IconButton.propTypes = {
  children: PropTypes.element.isRequired
};

export default IconButton;
