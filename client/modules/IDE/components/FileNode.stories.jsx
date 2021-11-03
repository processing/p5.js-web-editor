import React from 'react';
import { action } from '@storybook/addon-actions';

import { FileNode } from './FileNode';

export default {
  title: 'IDE/FileNode',
  component: FileNode
};

export const Show = () => (
  <FileNode
    id="nodeId"
    parantId="parentId"
    name="File name"
    fileType="jpeg"
    isSelectedFile
    isFolderClosed={false}
    setSelectedFile={action('setSelectedFile')}
    deleteFile={action('deleteFile')}
    updateFileName={action('updateFileName')}
    resetSelectedFile={action('resetSelectedFile')}
    newFile={action('newFile')}
    newFolder={action('newFolder')}
    showFolderChildren={action('showFolderChildren')}
    hideFolderChildren={action('hideFolderChildren')}
    openUploadFileModal={action('openUploadFileModal')}
    canEdit
    authenticated
  />
);
