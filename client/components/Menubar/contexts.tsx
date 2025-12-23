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
  setActiveIndex: (idx: number) => void;
  registerTopLevelItem: (
    ref: React.ForwardedRef<HTMLButtonElement>,
    id: string
  ) => void;
  setMenuOpen: (id: string) => void;
  menuItems: Set<HTMLElement>;
  hasFocus: boolean;
}

export const MenubarContext = createContext<MenubarContextType>({
  createMenuHandlers: () => ({}),
  createMenuItemHandlers: () => ({}),
  toggleMenuOpen: () => {},
  setActiveIndex: () => {},
  registerTopLevelItem: () => {},
  setMenuOpen: () => {},
  menuItems: new Set(),
  hasFocus: false
});

export interface SubmenuContextType {
  setSubmenuActiveIndex: (index: number) => void;
  registerSubmenuItem: (ref: RefObject<HTMLElement>) => () => void;
  first: () => void;
  last: () => void;
  submenuItems: Set<HTMLElement>;
  id: string;
  title: string;
}

export const SubmenuContext = createContext<SubmenuContextType>({
  setSubmenuActiveIndex: () => {},
  registerSubmenuItem: () => () => {},
  first: () => {},
  last: () => {},
  submenuItems: new Set<HTMLElement>(),
  id: '',
  title: ''
});
