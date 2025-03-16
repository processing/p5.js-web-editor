import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { useDispatch } from 'react-redux';
import * as FileActions from '../actions/files';

import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '../../../test-utils';
import FileNode from './FileNode';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn()
}));

jest.mock('../actions/files', () => ({
  updateFileName: jest.fn()
}));

const mockStore = configureStore([]);

describe('<FileNode />', () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    useDispatch.mockReturnValue(mockDispatch);
    jest.clearAllMocks();
  });

  const changeName = (newFileName) => {
    const renameButton = screen.getByText(/Rename/i);
    fireEvent.click(renameButton);

    const input = screen.getByTestId('input');
    fireEvent.change(input, { target: { value: newFileName } });
    fireEvent.blur(input);
  };

  const expectFileNameToBe = async (expectedName) => {
    const name = screen.getByTestId('file-name');
    await waitFor(() => within(name).queryByText(expectedName));
  };

  const renderFileNode = (fileType, extraState = {}) => {
    const initialState = {
      files: [
        {
          id: '0',
          name: fileType === 'folder' ? 'afolder' : 'test.jsx',
          fileType,
          parentId: 'root',
          children: [],
          isSelectedFile: false,
          isFolderClosed: false
        }
      ],
      user: { authenticated: false },
      ...extraState
    };

    const store = mockStore(initialState);

    render(
      <Provider store={store}>
        <FileNode id="0" canEdit />
      </Provider>
    );

    return { store };
  };

  describe('fileType: file', () => {
    it('cannot change to an empty name', async () => {
      renderFileNode('file');

      changeName('');

      await waitFor(() => expect(mockDispatch).not.toHaveBeenCalled());
      await expectFileNameToBe('test.jsx');
    });

    it('can change to a valid filename', async () => {
      const newName = 'newname.jsx';
      renderFileNode('file');

      changeName(newName);

      await waitFor(() =>
        expect(FileActions.updateFileName).toHaveBeenCalledWith('0', newName)
      );
      await expectFileNameToBe(newName);
    });

    it('must have an extension', async () => {
      const newName = 'newname';
      renderFileNode('file');

      changeName(newName);

      await waitFor(() => expect(mockDispatch).not.toHaveBeenCalled());
      await expectFileNameToBe('test.jsx');
    });

    it('can change to a different extension', async () => {
      const mockConfirm = jest.fn(() => true);
      window.confirm = mockConfirm;

      const newName = 'newname.gif';
      renderFileNode('file');

      changeName(newName);

      expect(mockConfirm).toHaveBeenCalled();
      await waitFor(() =>
        expect(FileActions.updateFileName).toHaveBeenCalledWith('0', newName)
      );
      await expectFileNameToBe(newName);
    });

    it('cannot be just an extension', async () => {
      const newName = '.jsx';
      renderFileNode('file');

      changeName(newName);

      await waitFor(() => expect(mockDispatch).not.toHaveBeenCalled());
      await expectFileNameToBe('test.jsx');
    });
  });

  describe('fileType: folder', () => {
    it('cannot change to an empty name', async () => {
      renderFileNode('folder');

      changeName('');

      await waitFor(() => expect(mockDispatch).not.toHaveBeenCalled());
      await expectFileNameToBe('afolder');
    });

    it('can change to another name', async () => {
      const newName = 'foldername';
      renderFileNode('folder');

      changeName(newName);

      await waitFor(() =>
        expect(FileActions.updateFileName).toHaveBeenCalledWith('0', newName)
      );
      await expectFileNameToBe(newName);
    });

    it('cannot have a file extension', async () => {
      const newName = 'foldername.jsx';
      renderFileNode('folder');

      changeName(newName);

      await waitFor(() => expect(mockDispatch).not.toHaveBeenCalled());
      await expectFileNameToBe('afolder');
    });
  });
});
