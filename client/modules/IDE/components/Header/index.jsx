import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import MediaQuery from 'react-responsive';
import Nav from './Nav';
import Toolbar from './Toolbar';

const Header = (props) => {
  const project = useSelector((state) => state.project);

  return (
    <header style={{ zIndex: 10 }}>
      <Nav />
      <MediaQuery minWidth={770}>
        {(matches) => {
          if (matches)
            return (
              <Toolbar
                syncFileContent={props.syncFileContent}
                key={project.id}
              />
            );
          return null;
        }}
      </MediaQuery>
    </header>
  );
};

Header.propTypes = {
  syncFileContent: PropTypes.func.isRequired
};

export default Header;
