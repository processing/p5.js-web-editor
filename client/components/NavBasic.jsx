import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';

import LogoIcon from '../images/p5js-logo-small.svg';
import ArrowIcon from '../images/triangle-arrow-left.svg';

class NavBasic extends React.PureComponent {
  static defaultProps = {
    onBack: null
  };

  render() {
    return (
      <nav
        className="nav"
        title="main-navigation"
        ref={(node) => {
          this.node = node;
        }}
      >
        <ul className="nav__items-left">
          <li className="nav__item-logo">
            <LogoIcon
              role="img"
              aria-label={this.props.t('Common.p5logoARIA')}
              focusable="false"
              className="svg__logo"
            />
          </li>
          {this.props.onBack && (
            <li className="nav__item">
              <button onClick={this.props.onBack}>
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
  }
}

NavBasic.propTypes = {
  onBack: PropTypes.func,
  t: PropTypes.func.isRequired
};

export default withTranslation()(NavBasic);
