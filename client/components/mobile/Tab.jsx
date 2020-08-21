import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router';
import { prop, remSize } from '../../theme';

export default styled(Link)`
  box-sizing: border-box;


  background: transparent;
  /* border-top: ${remSize(4)} solid ${props => prop(props.selected ? 'colors.p5jsPink' : 'MobilePanel.default.background')}; */
  border-top: ${remSize(4)} solid ${props => (props.selected ? prop('TabHighlight') : 'transparent')};

  color: ${prop('primaryTextColor')};

  padding: ${remSize(8)} ${remSize(16)};
  width: 30%;
`;
