import React from 'react';
import styled from 'styled-components';
import { prop } from '../../theme';


const background = prop('MobilePanel.default.background');
const textColor = prop('primaryTextColor');

export default styled.div`
  position: fixed;
  width: 100%;
  bottom: 0;
  background: ${background};
  color: ${textColor};
`;
