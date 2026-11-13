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
  MenubarItem: ({ children, hideIf, isDisabled }) => {
    if (hideIf) return null;
    return <li data-disabled={isDisabled ? 'true' : undefined}>{children}</li>;
  }
}));

// Nav reads LOGIN_ENABLED once at module load. It is unset in tests, which
// would disable login-dependent items, so load a copy of Nav in an isolated
// module registry with login enabled. The other tests keep the default config.
/* eslint-disable global-require */
const loginEnabledUtils = (() => {
  let isolated;
  jest.isolateModules(() => {
    jest.doMock('../../../../utils/getConfig', () => {
      const actual = jest.requireActual('../../../../utils/getConfig');
      return {
        ...actual,
        getConfig: (key, options) =>
          key === 'LOGIN_ENABLED' ? 'true' : actual.getConfig(key, options)
      };
    });
    isolated = {
      ...require('../../../../test-utils'),
      Nav: require('./Nav').default
    };
  });
  return isolated;
})();
/* eslint-enable global-require */

describe('Nav', () => {
  it("does not disable Save for a logged-in user viewing another user's sketch", () => {
    const { Nav: LoginNav, reduxRender: render, screen } = loginEnabledUtils;
    render(<LoginNav />, {
      mobile: false,
      initialState: {
        user: { authenticated: true, username: 'me', id: 'userId' },
        project: {
          name: 'testname',
          id: 'id',
          owner: { username: 'not-me', id: 'not-me' }
        }
      }
    });
    const saveItem = screen.getByText(/^Save/).closest('li');
    expect(saveItem).not.toHaveAttribute('data-disabled', 'true');
  });

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
