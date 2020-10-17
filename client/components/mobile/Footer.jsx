import React from 'react';
import styled from 'styled-components';
import { prop, grays } from '../../theme';


const background = prop('MobilePanel.default.background');
const textColor = prop('primaryTextColor');

export default styled.div`
  position: fixed;
  width: 100%;
  bottom: 0;
  background: ${background};
  color: ${textColor};

  & > * + * { border-top: dashed 1px ${prop('Separator')} }
`;
