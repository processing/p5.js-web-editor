import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';
import InlineSVG from 'react-inlinesvg';

const logoUrl = require('../images/p5js-logo-small.svg');
const editorUrl = require('../images/code.svg');

const PreviewNav = ({ owner, project }) => (
  <nav className="nav">
    <div className="nav__items-left">
      <div className="nav__item-logo">
        <InlineSVG src={logoUrl} alt="p5.js logo" />
      </div>
      <h3 className="nav__item"><b className="preview-nav__bold">{project.name}</b><span className="preview-nav__secondary">&nbsp;by&nbsp;</span><b>{owner.username}</b></h3>
    </div>
    <div className="nav__items-right">
      <Link to={`/${owner.username}/sketches/${project.id}`}>
        <InlineSVG className="preview-nav__editor-svg" src={editorUrl} />
      </Link>
    </div>
  </nav>
);

PreviewNav.propTypes = {
  owner: PropTypes.shape({
    username: PropTypes.string.isRequired
  }).isRequired,
  project: PropTypes.shape({
    name: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
  }).isRequired,
};

export default PreviewNav;
