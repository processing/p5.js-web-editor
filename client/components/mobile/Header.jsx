import React from 'react';
import styled from 'styled-components';
import { prop, remSize } from '../../theme';

const background = prop('Panel.default.background');
const textColor = prop('primaryTextColor');

const Header = styled.div`
  position: fixed;
  width: 100%;
  background: ${background};
  color: ${textColor};
  padding: ${remSize(12)};
  padding-left: ${remSize(32)};
  padding-right: ${remSize(32)};
  z-index: 1;

  display: flex;
  flex: 1;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`;

export default Header;
