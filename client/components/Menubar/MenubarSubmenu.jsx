// https://blog.logrocket.com/building-accessible-menubar-component-react

import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useContext, useMemo } from 'react';
import { useSelector } from 'react-redux';
import TriangleIcon from '../../images/down-filled-triangle.svg';
import { MenuOpenContext, MenubarContext, ParentMenuContext } from './contexts';

export function useMenuProps(id) {
  const activeMenu = useContext(MenuOpenContext);

  const isOpen = id === activeMenu;

  const { createMenuHandlers } = useContext(MenubarContext);

  const handlers = useMemo(() => createMenuHandlers(id), [
    createMenuHandlers,
    id
  ]);

  return { isOpen, handlers };
}

/* -------------------------------------------------------------------------------------------------
 * MenubarTrigger
 * -----------------------------------------------------------------------------------------------*/

function MenubarTrigger({ id, title, role, hasPopup, ...props }) {
  const { isOpen, handlers } = useMenuProps(id);

  // for better ui in rtl
  const direction = useSelector((state) => state.preferences.direction);
  let selectedClassNames = {
    nav__item_header: 'nav__item-header',
    nav__item_header_triangle: 'nav__item-header-triangle'
  };
  if (direction === 'rtl') {
    selectedClassNames = {
      nav__item_header: 'rtl-nav__item-header',
      nav__item_header_triangle: 'rtl-nav__item-header-triangle'
    };
  }

  return (
    <button
      {...handlers}
      {...props}
      role={role}
      aria-haspopup={hasPopup}
      aria-expanded={isOpen}
    >
      <span className={selectedClassNames.nav__item_header}>{title}</span>
      <TriangleIcon
        className={selectedClassNames.nav__item_header_triangle}
        focusable="false"
        aria-hidden="true"
      />
    </button>
  );
}

MenubarTrigger.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.node.isRequired,
  role: PropTypes.string,
  hasPopup: PropTypes.oneOf(['menu', 'listbox', 'true'])
};

MenubarTrigger.defaultProps = {
  role: 'menuitem',
  hasPopup: 'menu'
};

/* -------------------------------------------------------------------------------------------------
 * MenubarList
 * -----------------------------------------------------------------------------------------------*/

function MenubarList({ id, children, role, ...props }) {
  // change sub menu direction
  let newClassName = 'nav__dropdown';
  const direction = useSelector((state) => state.preferences.direction);
  if (direction === 'rtl') newClassName = 'rtl-nav__dropdown';

  return (
    <ul className={newClassName} role={role} {...props}>
      <ParentMenuContext.Provider value={id}>
        {children}
      </ParentMenuContext.Provider>
    </ul>
  );
}

MenubarList.propTypes = {
  id: PropTypes.string.isRequired,
  children: PropTypes.node,
  role: PropTypes.oneOf(['menu', 'listbox'])
};

MenubarList.defaultProps = {
  children: null,
  role: 'menu'
};

/* -------------------------------------------------------------------------------------------------
 * MenubarSubmenu
 * -----------------------------------------------------------------------------------------------*/

function MenubarSubmenu({
  id,
  title,
  children,
  triggerRole: customTriggerRole,
  listRole: customListRole,
  ...props
}) {
  const { isOpen } = useMenuProps(id);

  const triggerRole = customTriggerRole || 'menuitem';
  const listRole = customListRole || 'menu';

  const hasPopup = listRole === 'listbox' ? 'listbox' : 'menu';

  // change sub menu direction
  let newClassName = classNames('nav__item', isOpen && 'nav__item--open');
  const direction = useSelector((state) => state.preferences.direction);
  if (direction === 'rtl')
    newClassName = classNames('rtl-nav__item', isOpen && 'rtl-nav__item--open');

  return (
    <li className={newClassName}>
      <MenubarTrigger
        id={id}
        title={title}
        role={triggerRole}
        hasPopup={hasPopup}
        {...props}
      />
      <MenubarList id={id} role={listRole}>
        {children}
      </MenubarList>
    </li>
  );
}

MenubarSubmenu.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.node.isRequired,
  children: PropTypes.node,
  triggerRole: PropTypes.string,
  listRole: PropTypes.string
};

MenubarSubmenu.defaultProps = {
  children: null,
  triggerRole: 'menuitem',
  listRole: 'menu'
};

export default MenubarSubmenu;
