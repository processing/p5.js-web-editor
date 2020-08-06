import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import styled from 'styled-components';
import { remSize, prop, common } from '../theme';
import Header from './mobile/Header';
import IconButton from './mobile/IconButton';
import { ExitIcon } from '../common/icons';


const SidebarWrapper = styled.div`
  height: 100%;
  width: ${remSize(180)};

  position: absolute;
  z-index: 2;
  left: 0;

  background: white;
  box-shadow: 0 6px 6px 0 rgba(0,0,0,0.10);
`;

const Sidebar = ({ title, onPressClose }) => (
  <SidebarWrapper>
    {title &&
    <Header slim title={title} fixed={false}>
      <IconButton onPress={onPressClose} icon={ExitIcon} aria-label="Return to ide view" />
    </Header>}
  </SidebarWrapper>
);

Sidebar.propTypes = {
  title: PropTypes.string,
  onPressClose: PropTypes.func.isRequired,
};

Sidebar.defaultProps = {
  title: null,
  // onPressClose: PropTypes.func.isRequired,
};


export default Sidebar;
