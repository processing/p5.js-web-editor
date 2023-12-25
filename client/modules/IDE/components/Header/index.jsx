import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import MediaQuery from 'react-responsive';
import Nav from './Nav';
import Toolbar from './Toolbar';

const Header = (props) => {
  const project = useSelector((state) => state.project);

  return (
    <header>
      <Nav />
      <MediaQuery minWidth={770}>
        {(matches) => {
          if (matches)
            return (
              <Toolbar
                syncFileContent={props.syncFileContent}
                key={project.id}
                onClick={props.onClick}
              />
            );
          return null;
        }}
      </MediaQuery>
    </header>
  );
};

Header.propTypes = {
  syncFileContent: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired
};

export default Header;
