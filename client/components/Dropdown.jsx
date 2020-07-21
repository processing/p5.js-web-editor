import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';


// <ul className="nav__dropdown">


// <ul className="nav__dropdown">

// <li className="nav__dropdown-item">
//   <button
//     onFocus={this.handleFocusForLang}
//     onBlur={this.handleBlur}
//     value="it"
//     onClick={e => this.handleLangSelection(e)}
//   >
//     Italian (Test Fallback)
//   </button>
// </li>
// <li className="nav__dropdown-item">
//   <button
//     onFocus={this.handleFocusForLang}
//     onBlur={this.handleBlur}
//     value="en-US"
//     onClick={e => this.handleLangSelection(e)}
//   >English
//   </button>
// </li>
// <li className="nav__dropdown-item">
//   <button
//     onFocus={this.handleFocusForLang}
//     onBlur={this.handleBlur}
//     value="es-419"
//     onClick={e => this.handleLangSelection(e)}
//   >
//     Español
//   </button>
// </li>
// </ul>

// 'nav__item--open'

const Dropdown = ({ items }) => (
  <ul className="nav__dropdown">
    {items && items.map(item => (
      <li className="nav__dropdown-item">
      </li>
    ))
    }
  </ul>
);

Dropdown.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    action: PropTypes.func
  }))
};

Dropdown.defaultProps = {
  items: []
};

export default Dropdown;
