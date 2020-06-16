import React from 'react';
import styled from 'styled-components';
import { prop, remSize } from '../../theme';

const textColor = prop('primaryTextColor');

const IconButton = styled.button`
width: 3rem;
> svg {
  width: 100%;
  height: auto;
  fill: ${textColor};
  stroke: ${textColor};
}
`;

export default IconButton;
