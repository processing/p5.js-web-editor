import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Header = styled.div`
  width: 100%;
  color: orange;
  background: red;
`;

const Footer = styled.div`
  width: 100%;
  color: orange;
  background: blue;
  position: absolute;
  bottom: 0;
`;

const Screen = ({ children }) => (
  <div className="fullscreen-preview">
    {children}
  </div>
);
Screen.propTypes = {
  children: PropTypes.node.isRequired
};

export default () => (
  <Screen>
    <Header><h1>Test</h1></Header>
    <Footer><h1>Actionbar</h1></Footer>
  </Screen>
);
