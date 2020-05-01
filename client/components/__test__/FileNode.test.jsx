import React from 'react';
import { shallow } from 'enzyme';
import { FileNode } from '../../modules/IDE/components/FileNode';

describe('<FileNode />', () => {
  let component;
  let props = {};
  let input;
  let renameTriggerButton;
  const changeName = (newFileName) => {
    renameTriggerButton.simulate('click');
    input.simulate('change', { target: { value: newFileName } });
    input.simulate('blur');
  };
  const getState = () => component.state();
  const getUpdatedName = () => getState().updatedName;

  describe('with valid props, regardless of filetype', () => {
    ['folder', 'file'].forEach((fileType) => {
      beforeEach(() => {
        props = {
          ...props,
          id: '0',
          name: 'test.jsx',
          fileType,
          canEdit: true,
          children: [],
          authenticated: false,
          setSelectedFile: jest.fn(),
          deleteFile: jest.fn(),
          updateFileName: jest.fn(),
          resetSelectedFile: jest.fn(),
          newFile: jest.fn(),
          newFolder: jest.fn(),
          showFolderChildren: jest.fn(),
          hideFolderChildren: jest.fn(),
          openUploadFileModal: jest.fn(),
          setProjectName: jest.fn(),
        };
        component = shallow(<FileNode {...props} />);
      });

      describe('when changing name', () => {
        beforeEach(() => {
          input = component.find('.sidebar__file-item-input');
          renameTriggerButton = component
            .find('.sidebar__file-item-option')
            .first();
          component.setState({ isEditing: true });
        });

        describe('to an empty name', () => {
          const newName = '';
          beforeEach(() => changeName(newName));

          it('should not save', () => expect(props.updateFileName).not.toHaveBeenCalled());
          it('should reset name', () => expect(getUpdatedName()).toEqual(props.name));
        });
      });
    });
  });

  describe('as file with valid props', () => {
    beforeEach(() => {
      props = {
        ...props,
        id: '0',
        name: 'test.jsx',
        fileType: 'file',
        canEdit: true,
        children: [],
        authenticated: false,
        setSelectedFile: jest.fn(),
        deleteFile: jest.fn(),
        updateFileName: jest.fn(),
        resetSelectedFile: jest.fn(),
        newFile: jest.fn(),
        newFolder: jest.fn(),
        showFolderChildren: jest.fn(),
        hideFolderChildren: jest.fn(),
        openUploadFileModal: jest.fn()
      };
      component = shallow(<FileNode {...props} />);
    });

    describe('when changing name', () => {
      beforeEach(() => {
        input = component.find('.sidebar__file-item-input');
        renameTriggerButton = component
          .find('.sidebar__file-item-option')
          .first();
        component.setState({ isEditing: true });
      });
      it('should render', () => expect(component).toBeDefined());

      // it('should debug', () => console.log(component.debug()));

      describe('to a valid filename', () => {
        const newName = 'newname.jsx';
        beforeEach(() => changeName(newName));

        it('should save the name', () => {
          expect(props.updateFileName).toBeCalledWith(props.id, newName);
        });
      });

      // Failure Scenarios

      describe('to an extensionless filename', () => {
        const newName = 'extensionless';
        beforeEach(() => changeName(newName));
      });
      it('should not save', () => expect(props.setProjectName).not.toHaveBeenCalled());
      it('should reset name', () => expect(getUpdatedName()).toEqual(props.name));
      describe('to different extension', () => {
        const newName = 'name.gif';
        beforeEach(() => changeName(newName));

        it('should not save', () => expect(props.setProjectName).not.toHaveBeenCalled());
        it('should reset name', () => expect(getUpdatedName()).toEqual(props.name));
      });

      describe('to just an extension', () => {
        const newName = '.jsx';
        beforeEach(() => changeName(newName));

        it('should not save', () => expect(props.updateFileName).not.toHaveBeenCalled());
        it('should reset name', () => expect(getUpdatedName()).toEqual(props.name));
      });
    });
  });


  describe('as folder with valid props', () => {
    beforeEach(() => {
      props = {
        ...props,
        id: '0',
        children: [],
        name: 'filename',
        fileType: 'folder',
        canEdit: true,
        authenticated: false,
        setSelectedFile: jest.fn(),
        deleteFile: jest.fn(),
        updateFileName: jest.fn(),
        resetSelectedFile: jest.fn(),
        newFile: jest.fn(),
        newFolder: jest.fn(),
        showFolderChildren: jest.fn(),
        hideFolderChildren: jest.fn(),
        openUploadFileModal: jest.fn()
      };
      component = shallow(<FileNode {...props} />);
    });

    describe('when changing name', () => {
      beforeEach(() => {
        input = component.find('.sidebar__file-item-input');
        renameTriggerButton = component
          .find('.sidebar__file-item-option')
          .first();
        component.setState({ isEditing: true });
      });

      describe('to a foldername', () => {
        const newName = 'newfoldername';
        beforeEach(() => changeName(newName));

        it('should save', () => expect(props.updateFileName).toBeCalledWith(props.id, newName));
        it('should update name', () => expect(getUpdatedName()).toEqual(newName));
      });

      describe('to a filename', () => {
        const newName = 'filename.jsx';
        beforeEach(() => changeName(newName));

        it('should not save', () => expect(props.updateFileName).not.toHaveBeenCalled());
        it('should reset name', () => expect(getUpdatedName()).toEqual(props.name));
      });
    });
  });
});
