import React, { useEffect, useContext, useRef } from 'react';
import { MenubarContext, SubmenuContext, ParentMenuContext } from './contexts';
import { ButtonOrLink, ButtonOrLinkProps } from '../../common/ButtonOrLink';

export enum MenubarItemRole {
  MENU_ITEM = 'menuitem',
  OPTION = 'option'
}

export interface MenubarItemProps extends Omit<ButtonOrLinkProps, 'role'> {
  /**
   * Provides a way to deal with optional items.
   */
  role?: MenubarItemRole;
  selected?: boolean;
}

/**
 * MenubarItem wraps a button or link in an accessible list item that
 * integrates with keyboard navigation and other submenu behaviors.
 *
 * TO DO: how to document props passed through spread operator?
 * @component
 * @param {object} props
 * @param {string} [props.className='nav__dropdown-item'] - CSS class name to apply to the list item
 * @param {string} props.id - The id of the list item
 * @param {string} [props.role='menuitem'] - The role of the list item
 * @param {boolean} [props.isDisabled=false] - Whether to disable the item
 * @param {boolean} [props.selected=false] - Whether the item is selected
 * @returns {JSX.Element}
 *
 * @example <caption>Basic MenubarItem with click handler and keyboard shortcut</caption>
 * <MenubarItem id="sketch-run" onClick={() => dispatch(startSketch())}>
 *   Run
 *   <span className="nav__keyboard-shortcut">{metaKeyName}+Enter</span>
 * </MenubarItem>
 *
 * @example <caption>as an option in a listbox</caption>
 * <MenubarItem
 *   id={key}
 *   key={key}
 *   value={key}
 *   onClick={handleLangSelection}
 *   role="option"
 *   selected={key === language}
 * >
 *   {languageKeyToLabel(key)}
 * </MenubarItem>
 */

export function MenubarItem({
  className = 'nav__dropdown-item',
  id,
  role: customRole = MenubarItemRole.MENU_ITEM,
  isDisabled = false,
  selected = false,
  ...rest
}: MenubarItemProps) {
  const { createMenuItemHandlers, hasFocus } = useContext(MenubarContext);
  const {
    setSubmenuActiveIndex,
    submenuItems,
    registerSubmenuItem
  } = useContext(SubmenuContext);
  const parent = useContext(ParentMenuContext);

  const menuItemRef = useRef(null);

  const handlers = createMenuItemHandlers(parent);

  const role = customRole || 'menuitem';
  const ariaSelected = role === 'option' ? { 'aria-selected': selected } : {};

  const handleMouseEnter = () => {
    if (hasFocus) {
      const items = Array.from(submenuItems);
      const index = items.findIndex((item) => item === menuItemRef.current);
      if (index !== -1) {
        setSubmenuActiveIndex(index);
      }
    }
  };

  useEffect(() => {
    const unregister = registerSubmenuItem(menuItemRef);
    return unregister;
  }, [submenuItems, registerSubmenuItem]);

  return (
    <li
      className={`${className} ${
        isDisabled ? 'nav__dropdown-item--disabled' : ''
      }`}
      ref={menuItemRef}
      onMouseEnter={handleMouseEnter}
    >
      <ButtonOrLink
        {...rest}
        {...handlers}
        {...ariaSelected}
        role={role}
        tabIndex={-1}
        id={id}
        isDisabled={isDisabled}
      />
    </li>
  );
}
