import PropTypes from 'prop-types';
import React, { useRef } from 'react';
import { withTranslation } from 'react-i18next';

import LogoIcon from '../images/p5js-logo-small.svg';
import ArrowIcon from '../images/triangle-arrow-left.svg';

const NavBasic = ({ onBack, t }) => {
  const nodeRef = useRef(null);

  return (
    <nav className="nav" title="main-navigation" ref={nodeRef}>
      <ul className="nav__items-left">
        <li className="nav__item-logo">
          <LogoIcon
            role="img"
            aria-label={t('Common.p5logoARIA')}
            focusable="false"
            className="svg__logo"
          />
        </li>
        {onBack && (
          <li className="nav__item">
            <button onClick={onBack}>
              <span className="nav__item-header">
                <ArrowIcon focusable="false" aria-hidden="true" />
              </span>
              Back to the editor
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

NavBasic.propTypes = {
  onBack: PropTypes.func,
  t: PropTypes.func.isRequired
};

NavBasic.defaultProps = {
  onBack: null
};

export default withTranslation()(NavBasic);
