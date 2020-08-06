import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { prop, remSize } from '../../theme';

const background = transparent => prop(transparent ? 'backgroundColor' : 'MobilePanel.default.background');
const textColor = prop('primaryTextColor');


const HeaderDiv = styled.div`
  position: fixed;
  width: 100%;
  background: ${props => background(props.transparent === true)};
  color: ${textColor};
  padding: ${remSize(12)};
  padding-left: ${remSize(16)};
  padding-right: ${remSize(16)};
  z-index: 1;

  display: flex;
  flex: 1;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;

  svg {
    max-height: ${remSize(32)};
    padding: ${remSize(4)}
  }
`;

const IconContainer = styled.div`
  margin-left: ${props => (props.leftButton ? remSize(32) : remSize(4))};
  list-style: none;
  display: flex;
  flex-direction: horizontal;
`;


const TitleContainer = styled.div`
  margin-left: ${remSize(4)};
  margin-right: auto;

  ${props => props.padded && `h2{
    padding-top: ${remSize(10)};
    padding-bottom: ${remSize(10)};
  }`}
`;

const Header = ({
  title, subtitle, leftButton, children, transparent
}) => (
  <HeaderDiv transparent={transparent}>
    {leftButton}
    <TitleContainer padded={subtitle === null}>
      {title && <h2>{title}</h2>}
      {subtitle && <h3>{subtitle}</h3>}
    </TitleContainer>
    <IconContainer>
      {children}
    </IconContainer>
  </HeaderDiv>
);

Header.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  leftButton: PropTypes.element,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)]),
  transparent: PropTypes.bool
};

Header.defaultProps = {
  title: null,
  subtitle: null,
  leftButton: null,
  children: [],
  transparent: false
};

export default Header;
