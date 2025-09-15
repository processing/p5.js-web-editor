import React, { createContext, RefObject } from 'react';

export const ParentMenuContext = createContext<string>('none');

export const MenuOpenContext = createContext<string>('none');

interface MenubarContextType {
  createMenuHandlers: (
    id: string
  ) => Partial<{
    onMouseOver: (e: React.MouseEvent) => void;
    onClick: (e: React.MouseEvent) => void;
    onBlur: (e: React.FocusEvent) => void;
    onFocus: (e: React.FocusEvent) => void;
  }>;
  createMenuItemHandlers: (
    id: string
  ) => Partial<{
    onMouseUp: (e: React.MouseEvent) => void;
    onBlur: (e: React.FocusEvent) => void;
    onFocus: (e: React.FocusEvent) => void;
  }>;
  toggleMenuOpen: (id: string) => void;
  hasFocus: boolean;
}

export const MenubarContext = createContext<MenubarContextType>({
  createMenuHandlers: () => ({}),
  createMenuItemHandlers: () => ({}),
  toggleMenuOpen: () => {},
  hasFocus: false
});

export interface SubmenuContextType {
  submenuItems: Set<RefObject<HTMLElement>>;
  setSubmenuActiveIndex: (index: number) => void;
  registerSubmenuItem: (ref: RefObject<HTMLElement>) => () => void;
}

export const SubmenuContext = createContext<SubmenuContextType>({
  submenuItems: new Set(),
  setSubmenuActiveIndex: () => {},
  registerSubmenuItem: () => () => {}
});
