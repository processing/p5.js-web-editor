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

  // Navigate menu-items using arrow_keys
  handlers.onKeyDown = ({ key, target }) => {
    const { parentNode: targetParentNode } = target;

    if (targetParentNode && targetParentNode.parentNode) {
      const selector =
        targetParentNode.parentNode.getAttribute('role') === 'menu'
          ? '[role="menuitem"]'
          : '[role="option"]';
      const nodes = targetParentNode.parentNode.querySelectorAll(selector);

      const targetIdx = Array.from(nodes).findIndex((node) => node === target);
      if (targetIdx === -1) {
        return;
      }

      if (key === 'ArrowDown') {
        const nextIdx = (targetIdx + 1) % nodes.length;
        nodes[nextIdx]?.focus();
      } else if (key === 'ArrowUp') {
        const prevIdx = targetIdx - 1 < 0 ? nodes.length - 1 : targetIdx - 1;
        nodes[prevIdx]?.focus();
      }
    }
  };

  // Ensures that the menu-items can be navigated using the arrow_keys
  // from the place where the mouse is hovering
  handlers.onMouseEnter = (event) => {
    event.target.focus();
  };

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
