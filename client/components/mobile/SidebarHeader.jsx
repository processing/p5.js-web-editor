import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { prop, remSize } from '../../theme';

const textColor = ({ transparent, inverted }) =>
  prop(
    transparent === false && inverted === true
      ? 'MobilePanel.default.background'
      : 'primaryTextColor'
  );

const HeaderDiv = styled.div`
  width: 100%;
  color: ${textColor};
  z-index: 1;

  display: flex;
  flex: 1;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;

  border-bottom: 1px dashed ${prop('MobilePanel.default.border')};
`;

const IconContainer = styled.div`
  list-style: none;
  display: flex;
  flex-direction: horizontal;
`;

const TitleContainer = styled.div`
  padding-left: ${remSize(12)};
  padding-right: ${remSize(12)};
`;

const SidebarHeader = ({ title, children }) => (
  <HeaderDiv>
    <IconContainer>{children}</IconContainer>
    <TitleContainer>{title && <h2>{title}</h2>}</TitleContainer>
  </HeaderDiv>
);

SidebarHeader.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element)
  ])
};

SidebarHeader.defaultProps = {
  title: null,
  children: []
};

export default SidebarHeader;
