import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import useIsMobile from '../../hooks/useIsMobile';

import Nav from './Nav';
import Toolbar from './Toolbar';

const Header = (props) => {
  const project = useSelector((state) => state.project);

  const isMobile = useIsMobile();

  return (
    <>
      <Nav />
      {!isMobile && (
        <Toolbar syncFileContent={props.syncFileContent} key={project.id} />
      )}
    </>
  );
};

Header.propTypes = {
  syncFileContent: PropTypes.func.isRequired
};

export default Header;
