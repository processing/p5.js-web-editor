import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Button from '../../common/Button';

const ButtonWrapper = styled(Button)`
width: 3rem;
> svg {
  width: 100%;
  height: 100%;
}
`;

const IconButton = props => (<ButtonWrapper
  iconBefore={props.element}
  kind={Button.kinds.inline}
  {...props}
/>);

IconButton.propTypes = {
  element: PropTypes.element.isRequired
};

export default IconButton;
