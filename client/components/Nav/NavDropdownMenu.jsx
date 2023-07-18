import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useContext, useMemo } from 'react';
import TriangleIcon from '../../images/down-filled-triangle.svg';
import { MenuOpenContext, NavBarContext, ParentMenuContext } from './contexts';

function NavDropdownMenu({ id, title, children }) {
  const activeMenu = useContext(MenuOpenContext);

  const isOpen = id === activeMenu;

  const { createDropdownHandlers } = useContext(NavBarContext);

  const handlers = useMemo(
    () => createDropdownHandlers(id),
    [createDropdownHandlers, id]
  );

  return (
    <li className={classNames('nav__item', isOpen && 'nav__item--open')}>
      <button {...handlers}>
        <span className="nav__item-header">{title}</span>
        <TriangleIcon
          className="nav__item-header-triangle"
          focusable="false"
          aria-hidden="true"
        />
      </button>
      <ul className="nav__dropdown">
        <ParentMenuContext.Provider value={id}>
          {children}
        </ParentMenuContext.Provider>
      </ul>
    </li>
  );
}

NavDropdownMenu.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.node.isRequired,
  children: PropTypes.node
};

NavDropdownMenu.defaultProps = {
  children: null
};

export default NavDropdownMenu;
