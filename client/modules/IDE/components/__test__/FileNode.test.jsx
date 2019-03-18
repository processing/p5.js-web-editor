import React from 'react';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';
import { FileNode } from '../FileNode';


describe('FileNode', () => {
  const props = {
    id: '123456',
    parentId: 'abcdef',
    children: [],
    name: 'test.js',
    fileType: 'file',
    isSelectedFile: false,
    isFolderClosed: false,
    setSelectedFile: jest.fn(),
    deleteFile: jest.fn(),
    updateFileName: jest.fn(),
    resetSelectedFile: jest.fn(),
    newFile: jest.fn(),
    newFolder: jest.fn(),
    showFolderChildren: jest.fn(),
    hideFolderChildren: jest.fn(),
    canEdit: false
  };

  it('it renders file node', () => {
    const getWrapper = () => shallow(<FileNode {...props} />);
    const filenode = getWrapper();
    expect(filenode.exists('.file-item__content')).toEqual(true);
  });

  it('check selected file node displayed', () => {
    const getWrapper = () => shallow(<FileNode {...props} isSelectedFile />);
    const filenode = getWrapper();
    expect(filenode.exists('.sidebar__file-item--selected')).toEqual(true);
  });

  it('check selection of file on click', () => {
    const getWrapper = () => shallow(<FileNode {...props} isSelectedFile />);
    const fileNode = getWrapper();
    const nameButton = fileNode.find('.sidebar__file-item-name');
    nameButton.simulate('click', { stopPropagation() {} });
    expect(fileNode.exists('.sidebar__file-item--selected')).toEqual(true);
  });

  it('renders correctly', () => {
    const tree = renderer
      .create(<FileNode {...props} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
