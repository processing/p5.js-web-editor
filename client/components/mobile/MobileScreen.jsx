import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { remSize, prop } from '../../theme';

const ScreenWrapper = styled.div`
  .toast {
    font-size: ${remSize(12)};
    padding: ${remSize(8)};

    border-radius: ${remSize(4)};
    width: 92%;
    top: unset;
    min-width: unset;
    bottom: ${remSize(64)};
  }
  ${({ fullscreen }) =>
    fullscreen &&
    `
    display: flex;
    width: 100%;
    height: 100%;
    flex-flow: column;
    background-color: ${prop('backgroundColor')}
  `}
`;

const Screen = ({ children, fullscreen, slimheader }) => (
  <ScreenWrapper fullscreen={fullscreen} slimheader={slimheader}>
    {children}
  </ScreenWrapper>
);

Screen.defaultProps = {
  fullscreen: false,
  slimheader: false
};

Screen.propTypes = {
  children: PropTypes.node.isRequired,
  fullscreen: PropTypes.bool,
  slimheader: PropTypes.bool
};

export default Screen;
