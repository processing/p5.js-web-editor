/* eslint-disable react/prop-types */
import React from 'react';
import { reduxRender } from '../../../../test-utils';

import Nav from './Nav';

jest.mock('../../../../utils/generateRandomName');

// Mock the editor version so the snapshot stays stable across releases.
// The component reads the real version from package.json at runtime (it bumps
// every release), which would otherwise break these snapshots each release day.
jest.mock('../../../../../package.json', () => ({ version: '1.2.3' }));

// mock Menubar
jest.mock('../../../../components/Menubar/Menubar', () => ({
  Menubar: ({ children, className = 'nav__menubar' }) => (
    <ul className={className} role="menubar">
      {children}
    </ul>
  )
}));

// mock MenubarSubmenu
jest.mock('../../../../components/Menubar/MenubarSubmenu', () => {
  const MenubarSubmenu = ({ children, title }) => (
    <li className="nav__item">
      <span role="menuitem">{title}</span>
      <ul role="menu" aria-label={`${title} menu`}>
        {children}
      </ul>
    </li>
  );

  const useMenuProps = () => ({
    isOpen: false,
    handlers: {}
  });

  return {
    __esModule: true,
    MenubarSubmenu,
    useMenuProps
  };
});

// mock MenubarItem
jest.mock('../../../../components/Menubar/MenubarItem', () => ({
  MenubarItem: ({ children, hideIf }) => {
    if (hideIf) return null;
    return <li>{children}</li>;
  }
}));

describe('Nav', () => {
  it('renders editor version for desktop', () => {
    const { asFragment } = reduxRender(<Nav />, { mobile: false });
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders editor version for mobile', () => {
    const { asFragment } = reduxRender(<Nav />, { mobile: true });
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders dashboard version for desktop', () => {
    const { asFragment } = reduxRender(<Nav layout="dashboard" />, {
      mobile: false
    });
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders dashboard version for mobile', () => {
    const { asFragment } = reduxRender(<Nav layout="dashboard" />, {
      mobile: true
    });
    expect(asFragment()).toMatchSnapshot();
  });
});
