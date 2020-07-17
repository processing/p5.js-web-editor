import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { prop, remSize } from '../../theme';


const background = prop('MobilePanel.default.background');
const textColor = prop('primaryTextColor');

const FooterWrapper = styled.div`
  position: fixed;
  width: 100%;
  bottom: 0;
`;

const FooterContent = styled.div`
  background: ${background};
  color: ${textColor};
  padding: ${remSize(12)};
  padding-left: ${remSize(32)};
`;

const Footer = ({ before, children }) => (
  <FooterWrapper>
    {before}
    <FooterContent>
      {children}
    </FooterContent>
  </FooterWrapper>
);

Footer.propTypes = {
  before: PropTypes.element,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)]),
};

Footer.defaultProps = {
  before: <></>,
  children: <></>
};

export default Footer;
