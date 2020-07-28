import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { prop, remSize } from '../../theme';


const background = ({ transparent, inverted }) => prop(transparent === true
  ? 'backgroundColor'
  : `MobilePanel.default.${inverted === true ? 'foreground' : 'background'}`);

const textColor = ({ transparent, inverted }) => prop((transparent === false && inverted === true)
  ? 'MobilePanel.default.background'
  : 'primaryTextColor');


const HeaderDiv = styled.div`
  position: fixed;
  width: 100%;
  background: ${props => background(props)};
  color: ${textColor};
  padding: ${props => remSize(props.slim === true ? 2 : 12)};
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
    padding: ${remSize(4)};
  }

  & svg path { fill: ${textColor} !important; }
`;

const IconContainer = styled.div`
  margin-left: ${props => (props.leftButton ? remSize(32) : remSize(4))};
  display: flex;
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
  title, subtitle, leftButton, children,
  transparent, inverted, slim
}) => (
  <HeaderDiv transparent={transparent} slim={slim} inverted={inverted}>
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
  transparent: PropTypes.bool,
  inverted: PropTypes.bool,
  slim: PropTypes.bool,
};

Header.defaultProps = {
  title: null,
  subtitle: null,
  leftButton: null,
  children: [],
  transparent: false,
  inverted: false,
  slim: false
};

export default Header;
