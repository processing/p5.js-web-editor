import React from 'react';
import InlineSVG from 'react-inlinesvg';

const logoUrl = require('../images/p5js-logo-small.svg');

class NavBasic extends React.PureComponent {
  
  render() {
    return (
      <nav className="nav" title="main-navigation" ref={(node) => { this.node = node; }}>
        <ul className="nav__items-left" title="project-menu">
          <li className="nav__item-logo">
            <InlineSVG src={logoUrl} alt="p5.js logo" className="svg__logo" />
          </li>
        </ul>
      </nav>
    );
  }
}

NavBasic.propTypes = {};

export default NavBasic;
