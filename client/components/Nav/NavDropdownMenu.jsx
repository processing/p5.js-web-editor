import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useContext, useRef, useEffect, useMemo, useState } from 'react';
import TriangleIcon from '../../images/down-filled-triangle.svg';
import { MenuOpenContext, NavBarContext, ParentMenuContext } from './contexts';

export function useMenuProps(id) {
  const activeMenu = useContext(MenuOpenContext);

  const isOpen = id === activeMenu;

  const { createDropdownHandlers } = useContext(NavBarContext);

  const handlers = useMemo(() => createDropdownHandlers(id), [
    createDropdownHandlers,
    id
  ]);

  return { isOpen, handlers };
}

function NavDropdownMenu({ id, title, children }) {
  const { isOpen, handlers } = useMenuProps(id);
  const [isFirstChild, setIsFirstChild] = useState(false);
  const menuItemRef = useRef();
  const { menuItems } = useContext(NavBarContext);

  useEffect(() => {
    const menuItemNode = menuItemRef.current;
    if (menuItemNode) {
      if (!menuItems.size) {
        setIsFirstChild(true);
      }
      menuItems.add(menuItemNode);
    }

    return () => {
      menuItems.delete(menuItemNode);
    };
  }, [menuItems]);

  return (
    <li
      className={classNames('nav__item', isOpen && 'nav__item--open')}
      ref={menuItemRef}
    >
      <button
        {...handlers}
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        tabIndex={isFirstChild ? 0 : -1}
      >
        <span className="nav__item-header">{title}</span>
        <TriangleIcon
          className="nav__item-header-triangle"
          focusable="false"
          aria-hidden="true"
        />
      </button>
      <ul className="nav__dropdown" role="menu">
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
