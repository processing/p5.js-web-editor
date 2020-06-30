import React from 'react';
import styled from 'styled-components';
import { prop, remSize } from '../../theme';

const background = prop('Panel.default.background');
const textColor = prop('primaryTextColor');

const Footer = styled.div`
  position: fixed;
  width: 100%;
  background: ${background};
  color: ${textColor};
  padding: ${remSize(12)};
  padding-left: ${remSize(32)};
  z-index: 1;

  bottom: 0;
`;

export default Footer;
