import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { remSize } from '../../theme';

const ScreenWrapper = styled.div`
  .toast {
    margin-top: ${props => remSize(props.slimheader ? 49 : 68)};
    font-size: ${remSize(12)};
    z-index: 0.5;
    width: 100%;
    padding: ${remSize(8)};
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
