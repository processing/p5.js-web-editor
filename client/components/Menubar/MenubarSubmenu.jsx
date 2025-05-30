// https://blog.logrocket.com/building-accessible-menubar-component-react

import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
  useMemo
} from 'react';
import {
  MenuOpenContext,
  MenubarContext,
  SubmenuContext,
  ParentMenuContext
} from './contexts';
import TriangleIcon from '../../images/down-filled-triangle.svg';

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

/**
 * MenubarTrigger renders a button that toggles a submenu. It handles keyboard navigation and supports
 * screen readers. It needs to be within a submenu context.
 *
 * @param {Object} props
 * @param {string} [props.role='menuitem'] - The ARIA role of the trigger button
 * @param {string} [props.hasPopup='menu'] - The ARIA property that indicates the presence of a popup
 * @returns {JSX.Element}
 *
 * @example
 * <li
 *  className={classNames('nav__item', isOpen && 'nav__item--open')}
 *  ref={listItemRef}
 * >
 *  <MenubarTrigger
 *    ref={buttonRef}
 *    role={triggerRole}
 *    hasPopup={hasPopup}
 *    {...handlers}
 *    {...props}
 *    tabIndex={-1}
 *  />
 *  ... menubar list
 * </li>
 */

const MenubarTrigger = React.forwardRef(({ role, hasPopup, ...props }, ref) => {
  const {
    setActiveIndex,
    menuItems,
    registerTopLevelItem,
    hasFocus
  } = useContext(MenubarContext);
  const { id, title, first, last } = useContext(SubmenuContext);
  const { isOpen, handlers } = useMenuProps(id);

  const handleMouseEnter = () => {
    if (hasFocus) {
      const items = Array.from(menuItems);
      const index = items.findIndex((item) => item === ref.current);

      if (index !== -1) {
        setActiveIndex(index);
      }
    }
  };

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        if (!isOpen) {
          e.preventDefault();
          e.stopPropagation();
          first();
        }
        break;
      case 'ArrowUp':
        if (!isOpen) {
          e.preventDefault();
          e.stopPropagation();
          last();
        }
        break;
      case 'Enter':
      case ' ':
        if (!isOpen) {
          e.preventDefault();
          e.stopPropagation();
          first();
        }
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const unregister = registerTopLevelItem(ref, id);
    return unregister;
  }, [menuItems, registerTopLevelItem]);

  return (
    <button
      {...props}
      {...handlers}
      ref={ref}
      role={role}
      onMouseEnter={handleMouseEnter}
      onKeyDown={handleKeyDown}
      aria-haspopup={hasPopup}
      aria-expanded={isOpen}
    >
      <span className="nav__item-header">{title}</span>
      <TriangleIcon
        className="nav__item-header-triangle"
        focusable="false"
        aria-hidden="true"
      />
    </button>
  );
});

MenubarTrigger.propTypes = {
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

/**
 * MenubarList renders the container for menu items in a submenu. It provides context and handles ARIA roles.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - MenubarItems that should be rendered in the list
 * @param {string} [props.role='menu'] - The ARIA role of the list element
 * @returns {JSX.Element}
 *
 * @example
 * <MenubarList role={listRole}>
 *  ... <MenubarItem> elements
 * </MenubarList>
 */

function MenubarList({ children, role, ...props }) {
  const { id, title } = useContext(SubmenuContext);

  return (
    <ul
      className="nav__dropdown"
      role={role}
      aria-label={`${title} menu`}
      {...props}
    >
      <ParentMenuContext.Provider value={id}>
        {children}
      </ParentMenuContext.Provider>
    </ul>
  );
}

MenubarList.propTypes = {
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

/**
 * MenubarSubmenu manages a triggerable submenu within a menubar. It is a compound component
 * that manages the state of the submenu and its items. It also provides keyboard navigation
 * and screen reader support. Supports menu and listbox roles. Needs to be a direct child of Menubar.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - A list of menu items that will be rendered in the menubar
 * @param {string} props.id - The unique id of the submenu
 * @param {string} props.title - The title of the submenu
 * @param {string} [props.triggerRole='menuitem'] - The ARIA role of the trigger button
 * @param {string} [props.listRole='menu'] - The ARIA role of the list element
 * @returns {JSX.Element}
 *
 * @example
 * <Menubar>
 *  <MenubarSubmenu id="file" title="File">
 *    <MenubarItem id="file-new" onClick={handleNew}>New</MenubarItem>
 *    <MenubarItem id="file-save" onClick={handleSave}>Save</MenubarItem>
 *  </MenubarSubmenu>
 * </Menubar>
 */

function MenubarSubmenu({
  children,
  id,
  title,
  triggerRole: customTriggerRole,
  listRole: customListRole,
  ...props
}) {
  const { isOpen, handlers } = useMenuProps(id);
  const [submenuActiveIndex, setSubmenuActiveIndex] = useState(0);
  const { setMenuOpen, toggleMenuOpen } = useContext(MenubarContext);
  const submenuItems = useRef(new Set()).current;

  const buttonRef = useRef(null);
  const listItemRef = useRef(null);

  const triggerRole = customTriggerRole || 'menuitem';
  const listRole = customListRole || 'menu';
  const hasPopup = listRole === 'listbox' ? 'listbox' : 'menu';

  const prev = useCallback(() => {
    const newIndex =
      submenuActiveIndex < 0
        ? submenuItems.size - 1
        : (submenuActiveIndex - 1 + submenuItems.size) % submenuItems.size;
    setSubmenuActiveIndex(newIndex);
  }, [submenuActiveIndex, submenuItems]);

  const next = useCallback(() => {
    const newIndex = (submenuActiveIndex + 1) % submenuItems.size;
    setSubmenuActiveIndex(newIndex);
  }, [submenuActiveIndex, submenuItems]);

  const first = useCallback(() => {
    toggleMenuOpen(id);

    if (submenuItems.size > 0) {
      setSubmenuActiveIndex(0);
    }
  }, [submenuItems]);

  const last = useCallback(() => {
    toggleMenuOpen(id);
    if (submenuItems.size > 0) {
      setSubmenuActiveIndex(submenuItems.size - 1);
    }
  }, [submenuItems]);

  const activate = useCallback(() => {
    const items = Array.from(submenuItems);
    const activeItem = items[submenuActiveIndex];

    if (activeItem) {
      const activeItemNode = activeItem.firstChild;

      const isDisabled =
        activeItemNode.getAttribute('aria-disabled') === 'true';

      if (isDisabled) {
        return;
      }

      activeItemNode.click();

      toggleMenuOpen(id);

      if (buttonRef.current) {
        buttonRef.current.focus();
      }
    }
  }, [submenuActiveIndex, submenuItems, buttonRef]);

  const close = useCallback(() => {
    setMenuOpen('none');

    if (buttonRef.current) {
      buttonRef.current.focus();
    }
  }, [buttonRef]);

  const registerSubmenuItem = useCallback(
    (ref) => {
      const submenuItemNode = ref.current;

      if (submenuItemNode) {
        submenuItems.add(submenuItemNode);
      }

      return () => {
        submenuItems.delete(submenuItemNode);
      };
    },
    [submenuItems]
  );

  const keyHandlers = {
    ArrowUp: (e) => {
      if (!isOpen) return;
      e.preventDefault();
      e.stopPropagation();
      prev();
    },
    ArrowDown: (e) => {
      if (!isOpen) return;
      e.preventDefault();
      e.stopPropagation();
      next();
    },
    Enter: (e) => {
      if (!isOpen) return;
      e.preventDefault();
      e.stopPropagation();
      activate();
    },
    ' ': (e) => {
      // same as Enter
      if (!isOpen) return;
      e.preventDefault();
      e.stopPropagation();
      activate();
    },
    Escape: (e) => {
      if (!isOpen) return;
      e.preventDefault();
      e.stopPropagation();
      close();
    },
    Tab: (e) => {
      if (!isOpen) return;
      e.stopPropagation();
      setMenuOpen('none');
    }
    // TO DO: direct access keys
  };

  const handleKeyDown = useCallback(
    (e) => {
      if (!isOpen) return;

      const handler = keyHandlers[e.key];

      if (handler) {
        handler(e);
      }
    },
    [isOpen, keyHandlers]
  );

  useEffect(() => {
    if (!isOpen) {
      setSubmenuActiveIndex(-1);
    }
  }, [isOpen]);

  useEffect(() => {
    const el = listItemRef.current;
    if (!el) return () => {};

    el.addEventListener('keydown', handleKeyDown);
    return () => {
      el.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, keyHandlers]);

  useEffect(() => {
    if (isOpen && submenuItems.size > 0) {
      const items = Array.from(submenuItems);
      const activeItem = items[submenuActiveIndex];

      if (activeItem) {
        const activeNode = activeItem.querySelector(
          '[role="menuitem"], [role="option"]'
        );
        if (activeNode) {
          activeNode.focus();
        }
      }
    }
  }, [isOpen, submenuItems, submenuActiveIndex]);

  const submenuContext = useMemo(
    () => ({
      id,
      title,
      submenuItems,
      submenuActiveIndex,
      setSubmenuActiveIndex,
      registerSubmenuItem,
      first,
      last
    }),
    [
      id,
      title,
      submenuItems,
      submenuActiveIndex,
      setSubmenuActiveIndex,
      registerSubmenuItem,
      first,
      last
    ]
  );

  return (
    <SubmenuContext.Provider value={submenuContext}>
      <li
        className={classNames('nav__item', isOpen && 'nav__item--open')}
        ref={listItemRef}
      >
        <MenubarTrigger
          ref={buttonRef}
          role={triggerRole}
          hasPopup={hasPopup}
          {...handlers}
          {...props}
          tabIndex={-1}
        />
        <MenubarList role={listRole}>{children}</MenubarList>
      </li>
    </SubmenuContext.Provider>
  );
}

MenubarSubmenu.propTypes = {
  id: PropTypes.string.isRequired,
  children: PropTypes.node,
  title: PropTypes.node.isRequired,
  triggerRole: PropTypes.string,
  listRole: PropTypes.string
};

MenubarSubmenu.defaultProps = {
  children: null,
  triggerRole: 'menuitem',
  listRole: 'menu'
};

export default MenubarSubmenu;
