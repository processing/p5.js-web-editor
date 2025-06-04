import PropTypes from 'prop-types';
import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect
} from 'react';
import useModalClose from '../../common/useModalClose';
import { MenuOpenContext, MenubarContext } from './contexts';
import usePrevious from '../../common/usePrevious';

/**
 * Menubar manages a collection of menu items and their submenus. It provides keyboard navigation,
 * focus and state management, and other accessibility features for the menu items and submenus.
 *
 * @param {React.ReactNode} props.children - Menu items that will be rendered in the menubar
 * @param {string} [props.className='nav__menubar'] - CSS class name to apply to the menubar
 * @returns {JSX.Element}
 *
 * @example
 * <Menubar>
 *  <MenubarSubmenu id="file" title="File">
 *  ... menu items
 *  </MenubarSubmenu>
 * </Menubar>
 */

function Menubar({ children, className }) {
  const [menuOpen, setMenuOpen] = useState('none');
  const [activeIndex, setActiveIndex] = useState(0);
  const prevIndex = usePrevious(activeIndex);
  const [hasFocus, setHasFocus] = useState(false);

  const menuItems = useRef(new Set()).current;
  const menuItemToId = useRef(new Map()).current;

  const timerRef = useRef(null);

  const getMenuId = useCallback(
    (index) => {
      const items = Array.from(menuItems);
      const itemNode = items[index];
      return menuItemToId.get(itemNode);
    },
    [menuItems, menuItemToId, activeIndex]
  );

  const prev = useCallback(() => {
    const newIndex = (activeIndex - 1 + menuItems.size) % menuItems.size;
    setActiveIndex(newIndex);

    if (menuOpen !== 'none') {
      const newMenuId = getMenuId(newIndex);
      setMenuOpen(newMenuId);
    }
  }, [activeIndex, menuItems, menuOpen, getMenuId]);

  const next = useCallback(() => {
    const newIndex = (activeIndex + 1) % menuItems.size;
    setActiveIndex(newIndex);

    if (menuOpen !== 'none') {
      const newMenuId = getMenuId(newIndex);
      setMenuOpen(newMenuId);
    }
  }, [activeIndex, menuItems, menuOpen, getMenuId]);

  const first = useCallback(() => {
    setActiveIndex(0);
  }, []);

  const last = useCallback(() => {
    setActiveIndex(menuItems.size - 1);
  }, []);

  const close = useCallback(() => {
    if (menuOpen === 'none') return;

    const items = Array.from(menuItems);
    const activeNode = items[activeIndex];
    setMenuOpen('none');
    activeNode.focus();
  }, [activeIndex, menuItems, menuOpen]);

  const toggleMenuOpen = useCallback((id) => {
    setMenuOpen((prevState) => (prevState === id ? 'none' : id));
  });

  const registerTopLevelItem = useCallback(
    (ref, submenuId) => {
      const menuItemNode = ref.current;

      if (menuItemNode) {
        menuItems.add(menuItemNode);
        menuItemToId.set(menuItemNode, submenuId);
      }

      return () => {
        menuItems.delete(menuItemNode);
        menuItemToId.delete(menuItemNode);
      };
    },
    [menuItems, menuItemToId]
  );

  const clearHideTimeout = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [timerRef]);

  const handleClose = useCallback(() => {
    clearHideTimeout();
    setMenuOpen('none');
  }, [setMenuOpen]);

  const nodeRef = useModalClose(handleClose);

  const handleFocus = useCallback(() => {
    setHasFocus(true);
  }, []);

  const handleBlur = useCallback(
    (e) => {
      const isInMenu = nodeRef.current?.contains(document.activeElement);

      if (!isInMenu) {
        timerRef.current = setTimeout(() => {
          if (nodeRef.current) {
            setMenuOpen('none');
            setHasFocus(false);
          }
        }, 10);
      }
    },
    [nodeRef]
  );

  const keyHandlers = {
    ArrowLeft: (e) => {
      e.preventDefault();
      e.stopPropagation();
      prev();
    },
    ArrowRight: (e) => {
      e.preventDefault();
      e.stopPropagation();
      next();
    },
    Escape: (e) => {
      e.preventDefault();
      e.stopPropagation();
      close();
    },
    Tab: (e) => {
      e.stopPropagation();
    },
    Home: (e) => {
      e.preventDefault();
      e.stopPropagation();
      first();
    },
    End: (e) => {
      e.preventDefault();
      e.stopPropagation();
      last();
    }
    // TO DO: support direct access keys
  };

  useEffect(() => {
    if (activeIndex !== prevIndex) {
      const items = Array.from(menuItems);
      const activeNode = items[activeIndex];
      const prevNode = items[prevIndex];

      prevNode?.setAttribute('tabindex', '-1');
      activeNode?.setAttribute('tabindex', '0');

      if (hasFocus) {
        activeNode?.focus();
      }
    }
  }, [activeIndex, prevIndex, menuItems]);

  useEffect(() => {
    clearHideTimeout();
  }, [clearHideTimeout]);

  const contextValue = useMemo(
    () => ({
      createMenuHandlers: (menu) => ({
        onMouseOver: () => {
          setMenuOpen((prevState) => (prevState === 'none' ? 'none' : menu));
        },
        onClick: () => {
          toggleMenuOpen(menu);
          const items = Array.from(menuItems);
          const index = items.findIndex(
            (item) => menuItemToId.get(item) === menu
          );
          const item = items[index];
          if (index !== -1) {
            setActiveIndex(index);
            item.focus();
          }
        },
        onBlur: handleBlur,
        onFocus: clearHideTimeout
      }),
      createMenuItemHandlers: (menu) => ({
        onMouseUp: (e) => {
          if (e.button === 2) {
            return;
          }

          const isDisabled =
            e.currentTarget.getAttribute('aria-disabled') === 'true';

          if (isDisabled) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }

          setMenuOpen('none');
        },
        onBlur: handleBlur,
        onFocus: () => {
          clearHideTimeout();
          setMenuOpen(menu);
        }
      }),
      menuItems,
      activeIndex,
      setActiveIndex,
      registerTopLevelItem,
      setMenuOpen,
      toggleMenuOpen,
      hasFocus,
      setHasFocus
    }),
    [
      menuItems,
      activeIndex,
      setActiveIndex,
      registerTopLevelItem,
      menuOpen,
      toggleMenuOpen,
      hasFocus,
      setHasFocus,
      clearHideTimeout,
      handleBlur
    ]
  );

  return (
    <MenubarContext.Provider value={contextValue}>
      <ul
        className={className}
        role="menubar"
        ref={nodeRef}
        aria-orientation="horizontal"
        onFocus={handleFocus}
        onKeyDown={(e) => {
          const handler = keyHandlers[e.key];
          if (handler) {
            handler(e);
          }
        }}
      >
        <MenuOpenContext.Provider value={menuOpen}>
          {children}
        </MenuOpenContext.Provider>
      </ul>
    </MenubarContext.Provider>
  );
}

Menubar.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string
};

Menubar.defaultProps = {
  children: null,
  className: 'nav__menubar'
};

export default Menubar;
