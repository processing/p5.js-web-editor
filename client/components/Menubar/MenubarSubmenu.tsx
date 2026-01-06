// https://blog.logrocket.com/building-accessible-menubar-component-react

import classNames from 'classnames';
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

/** Custom subset of valid roles for the Menubar container */
export enum MenuContainerRole {
  MENU = 'menu',
  LISTBOX = 'listbox'
}

/** Custom subset of valid roles for the Menubar items */
export enum MenubarListItemRole {
  MENUITEM = 'menuitem',
  OPTION = 'option'
}

/* -------------------------------------------------------------------------------------------------
 * useMenuProps hook
 * -----------------------------------------------------------------------------------------------*/

export function useMenuProps(id: string) {
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

/** Custom subset of valid values for aria-hasPopup for the MenubarTrigger */
enum MenubarTriggerAriaHasPopup {
  MENU = MenuContainerRole.MENU,
  LISTBOX = MenuContainerRole.LISTBOX
}

interface MenubarTriggerProps
  extends Omit<
    React.ComponentProps<'button'>,
    'aria-haspopup' | 'aria-expanded' | 'onMouseEnter' | 'onKeyDown' | 'role'
  > {
  /** The ARIA role of the trigger button */
  role?: MenubarListItemRole;
  /** The ARIA property that indicates the presence of a popup */
  hasPopup?: MenubarTriggerAriaHasPopup;
}

/**
 * MenubarTrigger renders a button that toggles a submenu. It handles keyboard navigation and supports
 * screen readers. It needs to be within a submenu context.
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
const MenubarTrigger = React.forwardRef<HTMLButtonElement, MenubarTriggerProps>(
  (
    {
      role = MenubarListItemRole.MENUITEM,
      hasPopup = MenubarTriggerAriaHasPopup.MENU,
      ...props
    },
    ref
  ) => {
    const {
      setActiveIndex,
      menuItems,
      registerTopLevelItem,
      hasFocus
    } = useContext(MenubarContext);
    const { id, title, first, last } = useContext(SubmenuContext);
    const { isOpen, handlers } = useMenuProps(id);

    // `ref` is always a button from MenubarSubmenu, so safe to cast.
    const buttonRef = ref as React.RefObject<HTMLButtonElement>;

    const handleMouseEnter = (e: React.MouseEvent) => {
      if (hasFocus) {
        const items = Array.from(menuItems);
        const index = items.findIndex((item) => item === buttonRef.current);

        if (index !== -1) {
          setActiveIndex(index);
        }
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
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
  }
);

/* -------------------------------------------------------------------------------------------------
 * MenubarList
 * -----------------------------------------------------------------------------------------------*/

interface MenubarListProps {
  /** MenubarItems that should be rendered in the list */
  children?: React.ReactNode;
  /** The ARIA role of the list element */
  role?: MenuContainerRole;
}

/**
 * MenubarList renders the container for menu items in a submenu. It provides context and handles ARIA roles.
 * @example
 * <MenubarList role={listRole}>
 *  ... <MenubarItem> elements
 * </MenubarList>
 */
function MenubarList({
  children,
  role = MenuContainerRole.MENU,
  ...props
}: MenubarListProps) {
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

/* -------------------------------------------------------------------------------------------------
 * MenubarSubmenu
 * -----------------------------------------------------------------------------------------------*/
/**
 * Safely casts a value to an HTMLElement.
 *
 * @param {unknown | null} node - The value to check.
 * @returns {HTMLElement | null} The node if it is an HTMLElement, otherwise null.
 */
function getHTMLElement(node: unknown | null): HTMLElement | null {
  return node instanceof HTMLElement ? node : null;
}

export interface MenubarSubmenuProps {
  /** The unique id of the submenu */
  id: string;
  /** A list of menu items that will be rendered in the menubar */
  children?: React.ReactNode;
  /** The title of the submenu */
  title: string;
  /**  The ARIA role of the trigger button */
  triggerRole?: MenubarListItemRole;
  /** The ARIA role of the list element */
  listRole?: MenuContainerRole;
}

/**
 * MenubarSubmenu manages a triggerable submenu within a menubar. It is a compound component
 * that manages the state of the submenu and its items. It also provides keyboard navigation
 * and screen reader support. Supports menu and listbox roles. Needs to be a direct child of Menubar.
 *
 * @example
 * <Menubar>
 *  <MenubarSubmenu id="file" title="File">
 *    <MenubarItem id="file-new" onClick={handleNew}>New</MenubarItem>
 *    <MenubarItem id="file-save" onClick={handleSave}>Save</MenubarItem>
 *  </MenubarSubmenu>
 * </Menubar>
 */
export function MenubarSubmenu({
  children,
  id,
  title,
  triggerRole = MenubarListItemRole.MENUITEM,
  listRole = MenuContainerRole.MENU,
  ...props
}: MenubarSubmenuProps) {
  const { isOpen, handlers } = useMenuProps(id);
  const [submenuActiveIndex, setSubmenuActiveIndex] = useState(0);
  const { setMenuOpen, toggleMenuOpen } = useContext(MenubarContext);
  const submenuItems = useRef<Set<HTMLElement>>(new Set()).current;

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const listItemRef = useRef<HTMLLIElement | null>(null);

  const hasPopup =
    listRole === MenuContainerRole.LISTBOX
      ? MenubarTriggerAriaHasPopup.LISTBOX
      : MenubarTriggerAriaHasPopup.MENU;

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

    if (!activeItem) return;

    const activeItemNode = getHTMLElement(activeItem.firstChild);

    if (!activeItemNode) return;

    const isDisabled = activeItemNode.getAttribute('aria-disabled') === 'true';

    if (isDisabled) return;

    activeItemNode.click();

    toggleMenuOpen(id);

    if (buttonRef.current) {
      buttonRef.current.focus();
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

  const keyHandlers: Record<string, (e: React.KeyboardEvent) => void> = {
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
      if (!activeItem) return;

      const activeNode = getHTMLElement(
        activeItem.querySelector('[role="menuitem"], [role="option"]')
      );
      if (activeNode) {
        activeNode.focus();
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
