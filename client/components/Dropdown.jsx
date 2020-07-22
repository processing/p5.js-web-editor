import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import styled from 'styled-components';
import { remSize, prop, common } from '../theme';
import IconButton from './mobile/IconButton';
import Button from '../common/Button';


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
//   width: ${remSize(180)};
//   display: flex;
//   position: absolute;
//   flex-direction: column;
//   top: 95%;
//   height: auto;
//   z-index: 9999;
//   border-radius: ${remSize(6)};
//   & li:first-child {
//     border-radius: ${remSize(5)} ${remSize(5)} 0 0;
//   }
//   & li:last-child {
//     border-radius: 0 0 ${remSize(5)} ${remSize(5)};
//   }
// -------------
//   & li {
//     & button,
//     & a {
//       @include themify() {
//         color: getThemifyVariable('primary-text-color');
//       }
//       width: 100%;
//       text-align: left;
//       padding: ${remSize(8)} ${remSize(16)};
//     }
//     height: ${remSize(35)};
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


const DropdownWrapper = styled.ul`
  background-color: ${prop('Modal.background')};
  border: 1px solid ${prop('Modal.border')};
  box-shadow: 0 0 18px 0 ${prop('shadowColor')};
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

  & li:first-child { border-radius: ${remSize(5)} ${remSize(5)} 0 0; }
  & li:last-child  { border-radius: 0 0 ${remSize(5)} ${remSize(5)}; }

  & li:hover {
    
    background-color: ${prop('Button.hover.background')};
    color: ${prop('Button.hover.foreground')};

    & button, & a {
      color: ${prop('Button.hover.foreground')};
    }
  }

  li {
    height: ${remSize(36)};
    cursor: pointer;
    display: flex;
    align-items: center;

    & button,
    & a {
      color: ${prop('primaryTextColor')};
      width: 100%;
      text-align: left;
      padding: ${remSize(8)} ${remSize(16)};
    }
  }

`;

// { onPress
//   ? <IconButton
//   : <Link to={to}>{title}</Link>}

const MaybeIcon = (Element, label) => Element && <Element aria-label={label} />;

const Dropdown = ({ items }) => (
  <DropdownWrapper>
    {/* className="nav__items-left" */}
    {items && items.map(({ title, icon, href }) => (
      <li key={`nav-${title && title.toLowerCase()}`}>
        <Link to={href}>
          {MaybeIcon(icon, `Navigate to ${title}`)}
          {title}
        </Link>
      </li>
    ))
    }
  </DropdownWrapper>
);

Dropdown.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    action: PropTypes.func,
    icon: PropTypes.func,
    href: PropTypes.string
  })),
};

Dropdown.defaultProps = {
  items: [],
};

export default Dropdown;
