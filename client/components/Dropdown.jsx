import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import styled from 'styled-components';
import { remSize, prop, common } from '../theme';
import IconButton from './mobile/IconButton';
import Button from '../common/Button';

const DropdownWrapper = styled.ul`
  background-color: ${prop('Modal.background')};
  border: 1px solid ${prop('Modal.border')};
  box-shadow: 0 0 18px 0 ${prop('shadowColor')};
  color: ${prop('primaryTextColor')};

  position: absolute;
  right: ${props => (props.right ? 0 : 'initial')};
  left: ${props => (props.left ? 0 : 'initial')};

  ${props => (props.align === 'right' && 'right: 0;')}
  ${props => (props.align === 'left' && 'left: 0;')}


  text-align: left;
  width: ${remSize(180)};
  display: flex;
  flex-direction: column;
  height: auto;
  z-index: 2;
  border-radius: ${remSize(6)};

  & li:first-child { border-radius: ${remSize(5)} ${remSize(5)} 0 0; }
  & li:last-child  { border-radius: 0 0 ${remSize(5)} ${remSize(5)}; }

  & li:hover {
    
    background-color: ${prop('Button.hover.background')};
    color: ${prop('Button.hover.foreground')};

    * { color: ${prop('Button.hover.foreground')}; }
  }

  li {
    height: ${remSize(36)};
    cursor: pointer;
    display: flex;
    align-items: center;

    & button,
    & button span,
    & a {
      padding: ${remSize(8)} ${remSize(16)};
    }

    * {
      text-align: left;
      justify-content: left;

      color: ${prop('primaryTextColor')};
      width: 100%;
      justify-content: flex-start;
    }

    & button span { padding: 0px }
  }
`;

// TODO: Add Icon to the left of the items in the menu
// const MaybeIcon = (Element, label) => Element && <Element aria-label={label} />;

const Dropdown = ({ items, align }) => (
  <DropdownWrapper align={align} >
    {/* className="nav__items-left" */}
    {items && items.map(({
      title, icon, href, action
    }) => (
      <li key={`nav-${title && title.toLowerCase()}`}>
        {/* {MaybeIcon(icon, `Navigate to ${title}`)} */}
        {href
          ? <IconButton to={href}>{title}</IconButton>
          : <IconButton onClick={() => action()}>{title}</IconButton>}

      </li>
    ))
    }
  </DropdownWrapper>
);


Dropdown.propTypes = {
  align: PropTypes.oneOf(['left', 'right']),
  items: PropTypes.arrayOf(PropTypes.shape({
    action: PropTypes.func,
    icon: PropTypes.func,
    href: PropTypes.string,
    title: PropTypes.string
  })),
};

Dropdown.defaultProps = {
  items: [],
  align: null
};

export default Dropdown;
