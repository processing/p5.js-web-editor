
import React from 'react';
import { shallow } from 'enzyme';
import renderer from 'react-test-renderer';

import { NavComponent } from './../Nav';

describe('Nav', () => {
  const props = {
    newProject: jest.fn(),
    saveProject: jest.fn(),
    autosaveProject: jest.fn(),
    exportProjectAsZip: jest.fn(),
    cloneProject: jest.fn(),
    user: {
      authenticated: true,
      username: 'new-user',
      id: 'new-user'
    },
    project: {
      id: 'new-project',
      owner: {
        id: 'new-user'
      }
    },
    logoutUser: jest.fn(),
    newFile: jest.fn(),
    newFolder: jest.fn(),
    showShareModal: jest.fn(),
    showErrorModal: jest.fn(),
    unsavedChanges: false,
    warnIfUnsavedChanges: jest.fn(),
    showKeyboardShortcutModal: jest.fn(),
    cmController: {
      tidyCode: jest.fn(),
      showFind: jest.fn(),
      findNext: jest.fn(),
      findPrev: jest.fn()
    },
    startSketch: jest.fn(),
    stopSketch: jest.fn(),
    setAllAccessibleOutput: jest.fn()
  };
  const getWrapper = () => shallow(<NavComponent {...props} />);

  test('it renders main navigation', () => {
    const nav = getWrapper();
    expect(nav.exists('.nav')).toEqual(true);
  });

  it('renders correctly', () => {
    const tree = renderer
      .create(<NavComponent {...props} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
