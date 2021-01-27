import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { remSize, prop } from '../../theme';
import Button from '../../common/Button';
import IconButton from './IconButton';

const FloatingContainer = styled.div`
  position: fixed;
  right: ${remSize(16)};
  top: ${remSize(80)};

  text-align: right;
  z-index: 3;

  svg {
    width: ${remSize(32)};
  }
  svg > path {
    fill: ${prop('Button.default.background')} !important;
  }
`;

const FloatingNav = ({ items }) => (
  <FloatingContainer>
    {items.map(({ icon, onPress }) => (
      <IconButton onClick={onPress} icon={icon} />
    ))}
  </FloatingContainer>
);

FloatingNav.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.element,
      onPress: PropTypes.func
    })
  )
};

FloatingNav.defaultProps = {
  items: []
};

export default FloatingNav;
