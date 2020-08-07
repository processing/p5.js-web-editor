import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import styled from 'styled-components';
import { remSize, prop, common } from '../../theme';
import Header from './Header';
import IconButton from './IconButton';
import { ExitIcon } from '../../common/icons';


const SidebarWrapper = styled.div`
  height: 100%;
  width: ${remSize(180)};

  position: absolute;
  z-index: 2;
  left: 0;

  background: white;
  box-shadow: 0 6px 6px 0 rgba(0,0,0,0.10);
`;

const Sidebar = ({ title, onPressClose, children }) => (
  <SidebarWrapper>
    {title &&
    <Header slim title={title} fixed={false}>
      <IconButton onPress={onPressClose} icon={ExitIcon} aria-label="Return to ide view" />
    </Header>}
    {children}
  </SidebarWrapper>
);

Sidebar.propTypes = {
  title: PropTypes.string,
  onPressClose: PropTypes.func,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)]),
};

Sidebar.defaultProps = {
  title: null,
  children: [],
  onPressClose: () => {}
};


export default Sidebar;
