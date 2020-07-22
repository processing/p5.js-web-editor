import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import styled from 'styled-components';
import { remSize, prop, common } from '../theme';


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

// %dropdown-open {
//   @include themify() {
//     background-color: map-get($theme-map, 'modal-background-color');
//     border: 1px solid map-get($theme-map, 'modal-border-color');
//     box-shadow: 0 0 18px 0 getThemifyVariable('shadow-color');
//     color: getThemifyVariable('primary-text-color');
//   }
//   text-align: left;
//   width: #{180 / $base-font-size}rem;
//   display: flex;
//   position: absolute;
//   flex-direction: column;
//   top: 95%;
//   height: auto;
//   z-index: 9999;
//   border-radius: #{6 / $base-font-size}rem;
// -------------
//   & li:first-child {
//     border-radius: #{5 / $base-font-size}rem #{5 / $base-font-size}rem 0 0;
//   }
//   & li:last-child {
//     border-radius: 0 0 #{5 / $base-font-size}rem #{5 / $base-font-size}rem;
//   }
//   & li {
//     & button,
//     & a {
//       @include themify() {
//         color: getThemifyVariable('primary-text-color');
//       }
//       width: 100%;
//       text-align: left;
//       padding: #{8 / $base-font-size}rem #{16 / $base-font-size}rem;
//     }
//     height: #{35 / $base-font-size}rem;
//     cursor: pointer;
//     display: flex;
//     align-items: center;
//   }
//   & li:hover {
//     @include themify() {
//       background-color: getThemifyVariable('button-background-hover-color');
//       color: getThemifyVariable('button-hover-color')
//     }
//     & button, & a {
//       @include themify() {
//         color: getThemifyVariable('button-hover-color');
//       }
//     }
//   }
// }

// %dropdown-open-left {
//   @extend %dropdown-open;
//   left: 0;
// }

// %dropdown-open-right {
//   @extend %dropdown-open;
//   right: 0;
// }


const DropdownWrapper = styled.div`
  background-color: ${prop('Modal.background')};
  border: 1px solid ${prop('Modal.border')};
  box-shadow: 0 0 18px 0 ${common.shadowColor};
  color: ${prop('primaryTextColor')};

  text-align: left;
  width: ${remSize(180)};
  display: flex;
  position: absolute;
  flex-direction: column;
  top: 95%;
  height: auto;
  z-index: 9999;
  border-radius: ${remSize(6)};
`;


// @include themify() {
//   background-color: map-get($theme-map, 'modal-background-color');
//   border: 1px solid map-get($theme-map, 'modal-border-color');
//   box-shadow: 0 0 18px 0 getThemifyVariable('shadow-color');
//   color: getThemifyVariable('primary-text-color');
// }


const Dropdown = ({ items }) => (
  <DropdownWrapper>
    <h1>space</h1>
    <h1>space</h1>
    <h1>space</h1>
    <h1>space</h1>
    {/* className="nav__items-left" */}
    <ul className="nav__items-left nav__dropdown nav__item nav__item--open">
      <h1 className="nav__dropdown-item">hello</h1>
      <h1 className="nav__dropdown-item">hello</h1>
      {items && items.map(({ title }) => (
        <li className="nav__dropdown-item" key={`nav-${title && title.toLowerCase()}`}>
          <h1>space</h1>
        </li>
      ))
      }
    </ul>
  </DropdownWrapper>
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
