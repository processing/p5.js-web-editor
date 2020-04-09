import PropTypes from 'prop-types';
import React from 'react';
import InlineSVG from 'react-inlinesvg';

const logoUrl = require('../images/p5js-logo-small.svg');
const arrowUrl = require('../images/triangle-arrow-left.svg');

class NavBasic extends React.PureComponent {
  static defaultProps = {
    onBack: null
  }

  render() {
    return (
      <nav className="nav" title="main-navigation" ref={(node) => { this.node = node; }}>
        <ul className="nav__items-left" title="project-menu">
          <li className="nav__item-logo">
            <InlineSVG src={logoUrl} alt="p5.js logo" className="svg__logo" />
          </li>
          { this.props.onBack && (
            <li className="nav__item">
              <button onClick={this.props.onBack}>
                <span className="nav__item-header">
                  <InlineSVG src={arrowUrl} alt="Left arrow" />
                </span>
                Back to the editor
              </button>
            </li>)
          }
        </ul>
      </nav>
    );
  }
}

NavBasic.propTypes = {
  onBack: PropTypes.func,
};

export default NavBasic;
