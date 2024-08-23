import PropTypes from 'prop-types';
import React, { useContext, useMemo, useState, useRef, useEffect } from 'react';
import ButtonOrLink from '../../common/ButtonOrLink';
import { NavBarContext, ParentMenuContext, SubmenuContext } from './contexts';

function NavMenuItem({ hideIf, className, ...rest }) {
  const [isFirstChild, setIsFirstChild] = useState(false);
  const menuItemRef = useRef(null);
  const menubarContext = useContext(NavBarContext);
  const submenuContext = useContext(SubmenuContext);
  const { submenuItems } = submenuContext;
  const parent = useContext(ParentMenuContext);

  const { createMenuItemHandlers } = menubarContext;

  const handlers = useMemo(() => createMenuItemHandlers(parent), [
    createMenuItemHandlers,
    parent
  ]);

  useEffect(() => {
    const menuItemNode = menuItemRef.current;
    if (menuItemNode) {
      if (!submenuItems.size) {
        setIsFirstChild(true);
      }
      submenuItems.add(menuItemNode);
    }

    return () => {
      submenuItems.delete(menuItemNode);
    };
  }, [submenuItems]);

  if (hideIf) {
    return null;
  }

  const buttonProps = {
    ...rest,
    ...handlers,
    role: 'menuitem',
    tabIndex: !submenuContext && isFirstChild ? 0 : -1
  };

  return (
    <li className={className} ref={menuItemRef}>
      <ButtonOrLink {...buttonProps} />
    </li>
  );
}

NavMenuItem.propTypes = {
  ...ButtonOrLink.propTypes,
  onClick: PropTypes.func,
  value: PropTypes.string,
  /**
   * Provides a way to deal with optional items.
   */
  hideIf: PropTypes.bool,
  className: PropTypes.string
};

NavMenuItem.defaultProps = {
  onClick: null,
  value: null,
  hideIf: false,
  className: 'nav__dropdown-item'
};

export default NavMenuItem;
