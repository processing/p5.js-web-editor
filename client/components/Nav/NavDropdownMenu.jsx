import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useContext, useRef, useEffect, useMemo, useState } from 'react';
import TriangleIcon from '../../images/down-filled-triangle.svg';
import usePrevious from '../../modules/IDE/hooks/usePrevious';
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

export function useRovingFocusProps() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const prevIndex = usePrevious(currentIndex) ?? null;

  const [isFirstChild, setIsFirstChild] = useState(false);
  const { menuItems } = useContext(NavBarContext);
  const menuItemRef = useRef();

  useEffect(() => {
    const menuItemNode = menuItemRef.current;

    if (menuItemNode) {
      if (menuItems.size === 0) {
        setIsFirstChild(true);
      }

      menuItems.add(menuItemNode);
    }

    return () => {
      menuItems.delete(menuItemNode);
    };
  }, [menuItems]);

  useEffect(() => {
    if (currentIndex !== prevIndex) {
      const items = Array.from(menuItems);
      const currentNode = items[currentIndex]?.firstChild;
      const prevNode = items[prevIndex]?.firstChild;

      prevNode?.setAttribute('tabindex', '-1');
      currentNode?.setAttribute('tabindex', '0');
      currentNode?.focus();
    }
  }, [currentIndex, prevIndex, menuItems]);

  return { menuItemRef, isFirstChild };
}

function NavDropdownMenu({ id, title, children }) {
  const { isOpen, handlers } = useMenuProps(id);
  const { menuItemRef, isFirstChild } = useRovingFocusProps();

  return (
    <li className={classNames('nav__item', isOpen && 'nav__item--open')}>
      <button
        {...handlers}
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        ref={menuItemRef}
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
