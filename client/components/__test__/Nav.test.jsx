
import React from 'react';
import { render } from '@testing-library/react';


import { NavComponent } from '../Nav';

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
    setAllAccessibleOutput: jest.fn(),
    showToast: jest.fn(),
    setToastText: jest.fn(),
    rootFile: {
      id: 'root-file'
    },
    t: jest.fn()
  };

  it('renders correctly', () => {
    const { asFragment } = render(<NavComponent {...props} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
