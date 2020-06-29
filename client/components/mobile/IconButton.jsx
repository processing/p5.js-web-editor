import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Button from '../../common/Button';

const ButtonWrapper = styled(Button)`
width: 3rem;
> svg {
  width: 100%;
  height: auto;
}
`;

const IconButton = ({ children }) => (<ButtonWrapper
  aria-label="Add to collection"
  iconBefore={children}
  kind={Button.kinds.inline}
/>);

IconButton.propTypes = {
  children: PropTypes.element.isRequired
};

export default IconButton;
