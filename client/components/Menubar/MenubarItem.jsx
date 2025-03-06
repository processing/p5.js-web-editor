import PropTypes from 'prop-types';
import React, { useContext, useMemo } from 'react';
import ButtonOrLink from '../../common/ButtonOrLink';
import { MenubarContext, ParentMenuContext } from './contexts';

function MenubarItem({
  hideIf,
  className,
  role: customRole,
  selected,
  ...rest
}) {
  const parent = useContext(ParentMenuContext);

  const { createMenuItemHandlers } = useContext(MenubarContext);

  const handlers = useMemo(() => createMenuItemHandlers(parent), [
    createMenuItemHandlers,
    parent
  ]);

  if (hideIf) {
    return null;
  }

  const role = customRole || 'menuitem';
  const ariaSelected = role === 'option' ? { 'aria-selected': selected } : {};

  return (
    <li className={className}>
      <ButtonOrLink {...rest} {...handlers} {...ariaSelected} role={role} />
    </li>
  );
}

MenubarItem.propTypes = {
  ...ButtonOrLink.propTypes,
  onClick: PropTypes.func,
  value: PropTypes.string,
  /**
   * Provides a way to deal with optional items.
   */
  hideIf: PropTypes.bool,
  className: PropTypes.string,
  role: PropTypes.oneOf(['menuitem', 'option']),
  selected: PropTypes.bool
};

MenubarItem.defaultProps = {
  onClick: null,
  value: null,
  hideIf: false,
  className: 'nav__dropdown-item',
  role: 'menuitem',
  selected: false
};

export default MenubarItem;
