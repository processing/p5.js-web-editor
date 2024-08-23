import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {
  useContext,
  useRef,
  useEffect,
  useMemo,
  useState,
  useReducer,
  useCallback
} from 'react';
import TriangleIcon from '../../images/down-filled-triangle.svg';
import {
  MenuOpenContext,
  NavBarContext,
  ParentMenuContext,
  SubmenuContext
} from './contexts';
import useKeyDownHandlers from '../../common/useKeyDownHandlers';

const INIT_STATE = {
  currentIndex: null,
  prevIndex: null
};

function submenuReducer(state, { type, payload }) {
  switch (type) {
    case 'setIndex':
      return { ...state, currentIndex: payload, prevIndex: state.currentIndex };
    default:
      return state;
  }
}

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
  const submenuContext = useContext(SubmenuContext);
  const { isOpen, handlers } = useMenuProps(id);

  const { isFirstChild, first, last } = submenuContext;

  useKeyDownHandlers({
    Space: (e) => {
      e.preventDefault();
      e.stopPropagation();
      first();
    },
    ArrowDown: (e) => {
      // open the menu and focus on the first item
    }
    // handle match to char keys
  });

  const triggerProps = {
    ...handlers,
    ...props,
    role: 'menuitem',
    'aria-haspopup': 'menu',
    'aria-expanded': isOpen,
    tabIndex: isFirstChild ? 0 : -1
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
  const submenuContext = useContext(SubmenuContext);

  const { submenuItems, currentIndex, dispatch, first, last } = submenuContext;

  const prev = () => {
    const index = currentIndex === 0 ? submenuItems.size - 1 : currentIndex - 1;
    dispatch({ type: 'setIndex', payload: index });
  };

  const next = () => {
    const index = currentIndex === submenuItems.size - 1 ? 0 : currentIndex + 1;
    dispatch({ type: 'setIndex', payload: index });
  };

  useKeyDownHandlers({
    ArrowUp: (e) => {
      e.preventDefault();
      e.stopPropagation();
      prev();
    },
    ArrowDown: (e) => {
      e.preventDefault();
      e.stopPropagation();
      next();
    }
    // keydown event listener for letter keys
  });

  const listProps = {
    role: 'menu'
  };

  return (
    <ul className="nav__dropdown" {...listProps}>
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
  const submenuItems = useRef(new Set()).current;
  const [state, dispatch] = useReducer(submenuReducer, INIT_STATE);
  const { currentIndex, prevIndex } = state;

  const first = useCallback(() => {
    dispatch({ type: 'setIndex', payload: 0 });
  }, []);

  const last = useCallback(
    () => dispatch({ type: 'setIndex', payload: submenuItems.size - 1 }),
    [submenuItems.size]
  );

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

  useEffect(() => {
    const items = Array.from(submenuItems);

    if (currentIndex !== prevIndex) {
      const currentNode = items[currentIndex]?.firstChild;
      currentNode?.focus();
    }
  }, [submenuItems, currentIndex, prevIndex]);

  const value = useMemo(
    () => ({
      isFirstChild,
      submenuItems,
      currentIndex,
      dispatch,
      first,
      last
    }),
    [isFirstChild, submenuItems, currentIndex, first, last]
  );

  return (
    <SubmenuContext.Provider value={value}>
      <li
        className={classNames('nav__item', isOpen && 'nav__item--open')}
        ref={menuItemRef}
      >
        <NavTrigger id={id} title={title} />
        <NavList id={id}>{children}</NavList>
      </li>
    </SubmenuContext.Provider>
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
