import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { remSize, prop } from '../../theme';
import Nav from '../Nav';

const SidebarWrapper = styled.div`
  height: 100%;
  width: ${remSize(300)};

  position: fixed;
  z-index: 2;
  left: 0;

  background: ${prop('backgroundColor')};
  box-shadow: 0 6px 6px 0 rgba(0, 0, 0, 0.1);
`;

const Sidebar = ({ children }) => (
  <SidebarWrapper>
    <Nav layout="dashboard" disableBackToEditor />
    {children}
  </SidebarWrapper>
);

Sidebar.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element)
  ])
};

Sidebar.defaultProps = {
  children: []
};

export default Sidebar;
