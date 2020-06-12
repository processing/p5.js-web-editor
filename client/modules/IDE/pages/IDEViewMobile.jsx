import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Link } from 'react-router';

import { prop, remSize } from '../../../theme';

const background = prop('Button.default.background');
const textColor = prop('primaryTextColor');

const Header = styled.div`
  width: 100%;
  background-color: ${background} !important;
  color: ${textColor};
  padding-left: ${remSize(32)};
`;

const Footer = styled.div`
  width: 100%;
  position: absolute;
  bottom: 0;
  background: ${background};
  color: ${textColor};
  padding-left: ${remSize(32)};
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
    <Header><h1>Mobile View</h1></Header>


    <h3>
      <br />This page is under construction.
      <br /><Link to="/">Click here</Link> to return to the regular editor
    </h3>

    <Footer><h1>Bottom Bar</h1></Footer>
  </Screen>
);
