import { createContext } from 'react';

export const ParentMenuContext = createContext('none');

export const MenuOpenContext = createContext('none');

export const MenubarContext = createContext({
  createMenuHandlers: () => ({}),
  createMenuItemHandlers: () => ({}),
  toggleMenuOpen: () => {}
});
