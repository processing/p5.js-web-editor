import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { remSize } from '../../theme';

const ScreenWrapper = styled.div`
  .toast {
    font-size: ${remSize(12)};
    padding: ${remSize(8)};

    border-radius: ${remSize(4)};
    width: 90%;
    bottom: ${remSize(64)}
  }
`;

const Screen = ({ children, fullscreen, slimheader }) => (
  <ScreenWrapper className={fullscreen && 'fullscreen-preview'} slimheader={slimheader}>
    {children}
  </ScreenWrapper>
);

Screen.defaultProps = {
  fullscreen: false,
  slimheader: false,
};

Screen.propTypes = {
  children: PropTypes.node.isRequired,
  fullscreen: PropTypes.bool,
  slimheader: PropTypes.bool
};

export default Screen;
