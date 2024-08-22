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

function NavTrigger({ id, title, ...props }) {
  const { isOpen, handlers } = useMenuProps(id);
  const menubarContext = useContext(NavBarContext);

  const keyDown = (e) => {
    switch (e.key) {
      case 'Enter':
      case 'Space':
        e.stopPropagation();
        // first();
        console.log('space');
        break;
      default:
        break;
    }
  };

  const triggerProps = {
    ...handlers,
    ...props,
    role: 'menuitem',
    'aria-haspopup': 'menu',
    'aria-expanded': isOpen,
    tabIndex: 0,
    onKeyDown: (e) => {
      keyDown(e);
    }
  };

  return (
    <button {...triggerProps}>
      <span className="nav__item-header">{title}</span>
      <TriangleIcon
        className="nav__item-header-triangle"
        focusable="false"
        aria-hidden="true"
      />
    </button>
  );
}

NavTrigger.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.node.isRequired
};

function NavList({ children, id }) {
  return (
    <ul className="nav__dropdown" role="menu">
      <ParentMenuContext.Provider value={id}>
        {children}
      </ParentMenuContext.Provider>
    </ul>
  );
}

NavList.propTypes = {
  id: PropTypes.string.isRequired,
  children: PropTypes.node
};

NavList.defaultProps = {
  children: null
};

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
      <NavTrigger id={id} title={title} />
      <NavList id={id}>{children}</NavList>
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
