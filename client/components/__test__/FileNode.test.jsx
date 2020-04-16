import React from 'react';
import { shallow } from 'enzyme';
import { FileNode } from '../../modules/IDE/components/FileNode';

beforeAll(() => {});
describe('<FileNode />', () => {
  let component;
  let props = {};

  describe('with valid props', () => {
    beforeEach(() => {
      props = {
        ...props,
        id: '0',
        children: [],
        name: 'test.jsx',
        fileType: 'dunno',
        setSelectedFile: jest.fn(),
        deleteFile: jest.fn(),
        updateFileName: jest.fn(),
        resetSelectedFile: jest.fn(),
        newFile: jest.fn(),
        newFolder: jest.fn(),
        showFolderChildren: jest.fn(),
        hideFolderChildren: jest.fn(),
        canEdit: true,
      };
      component = shallow(<FileNode {...props} />);
    });

    describe('when changing name', () => {
      let input;
      let renameTriggerButton;
      const changeName = (newFileName) => {
        renameTriggerButton.simulate('click');
        input.simulate('change', { target: { value: newFileName } });
        input.simulate('blur');
      };

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

      describe('to an empty filename', () => {
        const newName = '';
        beforeEach(() => changeName(newName));

        it('should not save the name', () => {
          expect(props.updateFileName).not.toHaveBeenCalled();
        });
      });
    });
  });
});
