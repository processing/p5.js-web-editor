import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useContext, useMemo } from 'react';
import { useFloating, autoUpdate, shift, limitShift } from '@floating-ui/react';
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

const isSafari = () =>
  /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

function NavDropdownMenu({ id, title, children }) {
  const { isOpen, handlers } = useMenuProps(id);

  const middleware = isSafari()
    ? [
        shift({
          mainAxis: false
        })
      ]
    : [shift()];

  const { refs, floatingStyles } = useFloating({
    whileElementsMounted: autoUpdate,
    placement: 'bottom-start',
    middleware
  });

  return (
    <li
      className={classNames('nav__item', isOpen && 'nav__item--open')}
      ref={refs.setReference}
    >
      <button {...handlers}>
        <span className="nav__item-header">{title}</span>
        <TriangleIcon
          className="nav__item-header-triangle"
          focusable="false"
          aria-hidden="true"
        />
      </button>
      <ul
        className="nav__dropdown"
        ref={refs.setFloating}
        style={floatingStyles}
      >
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
