import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';
import { withTranslation } from 'react-i18next';

import LogoIcon from '../images/p5js-logo-small.svg';
import CodeIcon from '../images/code.svg';

const PreviewNav = ({ owner, project, t }) => (
  <nav className="nav preview-nav">
    <div className="nav__items-left">
      <div className="nav__item-logo">
        <LogoIcon role="img" aria-label={t('Common.p5logoARIA')} focusable="false" className="svg__logo" />
      </div>
      <Link className="nav__item" to={`/${owner.username}/sketches/${project.id}`}>{project.name}</Link>
      <p className="toolbar__project-owner">{t('PreviewNav.ByUser')}</p>
      <Link className="nav__item" to={`/${owner.username}/sketches/`}>{owner.username}</Link>
    </div>
    <div className="nav__items-right">
      <Link to={`/${owner.username}/sketches/${project.id}`} aria-label={t('PreviewNav.EditSketchARIA')} >
        <CodeIcon className="preview-nav__editor-svg" focusable="false" aria-hidden="true" />
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
  t: PropTypes.func.isRequired
};

export default withTranslation()(PreviewNav);
