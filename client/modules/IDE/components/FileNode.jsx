import PropTypes from 'prop-types';
import classNames from 'classnames';
import React, { useState, useRef } from 'react';
import { connect } from 'react-redux';
import { useTranslation } from 'react-i18next';

import * as IDEActions from '../actions/ide';
import * as FileActions from '../actions/files';
import DownArrowIcon from '../../../images/down-filled-triangle.svg';
import FolderRightIcon from '../../../images/triangle-arrow-right.svg';
import FolderDownIcon from '../../../images/triangle-arrow-down.svg';
import FileTypeIcon from './FileTypeIcon';

function parseFileName(name) {
  const nameArray = name.split('.');
  if (nameArray.length > 1) {
    const extension = `.${nameArray[nameArray.length - 1]}`;
    const baseName = nameArray.slice(0, -1).join('.');
    const firstLetter = baseName[0];
    const lastLetter = baseName[baseName.length - 1];
    const middleText = baseName.slice(1, -1);
    return {
      baseName,
      firstLetter,
      lastLetter,
      middleText,
      extension
    };
  }
  const firstLetter = name[0];
  const lastLetter = name[name.length - 1];
  const middleText = name.slice(1, -1);
  return {
    baseName: name,
    firstLetter,
    lastLetter,
    middleText
  };
}

function FileName({ name }) {
  const {
    baseName,
    firstLetter,
    lastLetter,
    middleText,
    extension
  } = parseFileName(name);
  return (
    <span className="sidebar__file-item-name-text">
      <span>{firstLetter}</span>
      {baseName.length > 2 && (
        <span className="sidebar__file-item-name--ellipsis">{middleText}</span>
      )}
      {baseName.length > 1 && <span>{lastLetter}</span>}
      {extension && <span>{extension}</span>}
    </span>
  );
}

FileName.propTypes = {
  name: PropTypes.string.isRequired
};

const FileNode = ({
  id,
  parentId,
  children,
  name,
  fileType,
  isSelectedFile,
  isFolderClosed,
  setSelectedFile,
  deleteFile,
  updateFileName,
  resetSelectedFile,
  newFile,
  newFolder,
  showFolderChildren,
  hideFolderChildren,
  canEdit,
  openUploadFileModal,
  authenticated,
  onClickFile
}) => {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatedName, setUpdatedName] = useState(name);

  const { t } = useTranslation();
  const fileNameInput = useRef(null);
  const fileOptionsRef = useRef(null);

  const handleFileClick = (event) => {
    event.stopPropagation();
    if (name !== 'root' && !isDeleting) {
      setSelectedFile(id);
    }
    if (onClickFile) {
      onClickFile();
    }
  };

  const handleFileNameChange = (event) => {
    setUpdatedName(event.target.value);
  };

  const showEditFileName = () => {
    setIsEditingName(true);
  };

  const hideFileOptions = () => {
    setIsOptionsOpen(false);
  };

  const handleClickRename = () => {
    setUpdatedName(name);
    showEditFileName();
    setTimeout(() => fileNameInput.current.focus(), 0);
    setTimeout(() => hideFileOptions(), 0);
  };

  const handleClickAddFile = () => {
    newFile(id);
    setTimeout(() => hideFileOptions(), 0);
  };

  const handleClickAddFolder = () => {
    newFolder(id);
    setTimeout(() => hideFileOptions(), 0);
  };

  const handleClickUploadFile = () => {
    openUploadFileModal(id);
    setTimeout(hideFileOptions, 0);
  };

  const handleClickDelete = () => {
    const prompt = t('Common.DeleteConfirmation', { name });

    if (window.confirm(prompt)) {
      setIsDeleting(true);
      resetSelectedFile(id);
      setTimeout(() => deleteFile(id, parentId), 100);
    }
  };

  const hideEditFileName = () => {
    setIsEditingName(false);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      hideEditFileName();
    }
  };

  const saveUpdatedFileName = () => {
    if (updatedName !== name) {
      updateFileName(id, updatedName);
    }
  };

  const validateFileName = () => {
    const currentName = name;
    const oldFileExtension = currentName.match(/\.[0-9a-z]+$/i);
    const newFileExtension = updatedName.match(/\.[0-9a-z]+$/i);
    const hasPeriod = updatedName.match(/\.+/);
    const hasNoExtension = oldFileExtension && !newFileExtension;
    const hasExtensionIfFolder = fileType === 'folder' && hasPeriod;
    const notSameExtension =
      oldFileExtension &&
      newFileExtension &&
      oldFileExtension[0].toLowerCase() !== newFileExtension[0].toLowerCase();
    const hasEmptyFilename = updatedName.trim() === '';
    const hasOnlyExtension =
      newFileExtension && updatedName.trim() === newFileExtension[0];
    if (
      hasEmptyFilename ||
      hasNoExtension ||
      hasOnlyExtension ||
      hasExtensionIfFolder
    ) {
      setUpdatedName(currentName);
    } else if (notSameExtension) {
      const userResponse = window.confirm(
        'Are you sure you want to change the file extension?'
      );
      if (userResponse) {
        saveUpdatedFileName();
      } else {
        setUpdatedName(currentName);
      }
    } else {
      saveUpdatedFileName();
    }
  };

  const handleFileNameBlur = () => {
    validateFileName();
    hideEditFileName();
  };

  const toggleFileOptions = (event) => {
    event.preventDefault();
    if (!canEdit) {
      return;
    }
    setIsOptionsOpen(!isOptionsOpen);
  };

  const itemClass = classNames({
    'sidebar__root-item': name === 'root',
    'sidebar__file-item': name !== 'root',
    'sidebar__file-item--selected': isSelectedFile,
    'sidebar__file-item--open': isOptionsOpen,
    'sidebar__file-item--editing': isEditingName,
    'sidebar__file-item--closed': isFolderClosed
  });

  const isFile = fileType === 'file';
  const isFolder = fileType === 'folder';
  const isRoot = name === 'root';

  const { extension } = parseFileName(name);

  return (
    <div className={itemClass}>
      {!isRoot && (
        <div className="file-item__content" onContextMenu={toggleFileOptions}>
          <span className="file-item__spacer"></span>
          {isFile && (
            <span className="sidebar__file-item-icon">
              <FileTypeIcon
                fileExtension={extension}
                focusable="false"
                aria-hidden="true"
              />
            </span>
          )}
          {isFolder && (
            <div className="sidebar__file-item--folder">
              <button
                className="sidebar__file-item-closed"
                onClick={() => showFolderChildren(id)}
                aria-label={t('FileNode.OpenFolderARIA')}
                title={t('FileNode.OpenFolderARIA')}
              >
                <FolderRightIcon
                  className="folder-right"
                  focusable="false"
                  aria-hidden="true"
                />
              </button>
              <button
                className="sidebar__file-item-open"
                onClick={() => hideFolderChildren(id)}
                aria-label={t('FileNode.CloseFolderARIA')}
                title={t('FileNode.CloseFolderARIA')}
              >
                <FolderDownIcon
                  className="folder-down"
                  focusable="false"
                  aria-hidden="true"
                />
              </button>
            </div>
          )}
          <button
            aria-label={updatedName}
            className="sidebar__file-item-name"
            onClick={handleFileClick}
            data-testid="file-name"
          >
            <FileName name={updatedName} />
          </button>
          <input
            data-testid="input"
            type="text"
            className="sidebar__file-item-input"
            value={updatedName}
            maxLength="128"
            onChange={handleFileNameChange}
            ref={fileNameInput}
            onBlur={handleFileNameBlur}
            onKeyPress={handleKeyPress}
          />
          <button
            className="sidebar__file-item-show-options"
            aria-label={t('FileNode.ToggleFileOptionsARIA')}
            ref={fileOptionsRef}
            tabIndex="0"
            onClick={toggleFileOptions}
          >
            <DownArrowIcon focusable="false" aria-hidden="true" />
          </button>
          <div className="sidebar__file-item-options">
            <ul title="file options">
              {isFolder && (
                <>
                  <li>
                    <button
                      aria-label={t('FileNode.AddFolderARIA')}
                      onClick={handleClickAddFolder}
                      className="sidebar__file-item-option"
                    >
                      {t('FileNode.AddFolder')}
                    </button>
                  </li>
                  <li>
                    <button
                      aria-label={t('FileNode.AddFileARIA')}
                      onClick={handleClickAddFile}
                      className="sidebar__file-item-option"
                    >
                      {t('FileNode.AddFile')}
                    </button>
                  </li>
                  {authenticated && (
                    <li>
                      <button
                        aria-label={t('FileNode.UploadFileARIA')}
                        onClick={handleClickUploadFile}
                      >
                        {t('FileNode.UploadFile')}
                      </button>
                    </li>
                  )}
                </>
              )}
              <li>
                <button
                  onClick={handleClickRename}
                  className="sidebar__file-item-option"
                >
                  {t('FileNode.Rename')}
                </button>
              </li>
              <li>
                <button
                  onClick={handleClickDelete}
                  className="sidebar__file-item-option"
                >
                  {t('FileNode.Delete')}
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
      {children && (
        <ul className="file-item__children">
          {children.map((childId) => (
            <li key={childId}>
              <ConnectedFileNode
                id={childId}
                parentId={id}
                canEdit={canEdit}
                onClickFile={onClickFile}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

FileNode.propTypes = {
  id: PropTypes.string.isRequired,
  parentId: PropTypes.string,
  children: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  name: PropTypes.string.isRequired,
  fileType: PropTypes.string.isRequired,
  isSelectedFile: PropTypes.bool,
  isFolderClosed: PropTypes.bool,
  setSelectedFile: PropTypes.func.isRequired,
  deleteFile: PropTypes.func.isRequired,
  updateFileName: PropTypes.func.isRequired,
  resetSelectedFile: PropTypes.func.isRequired,
  newFile: PropTypes.func.isRequired,
  newFolder: PropTypes.func.isRequired,
  showFolderChildren: PropTypes.func.isRequired,
  hideFolderChildren: PropTypes.func.isRequired,
  canEdit: PropTypes.bool.isRequired,
  openUploadFileModal: PropTypes.func.isRequired,
  authenticated: PropTypes.bool.isRequired,
  onClickFile: PropTypes.func
};

FileNode.defaultProps = {
  onClickFile: null,
  parentId: '0',
  isSelectedFile: false,
  isFolderClosed: false
};

function mapStateToProps(state, ownProps) {
  // this is a hack, state is updated before ownProps
  const fileNode = state.files.find((file) => file.id === ownProps.id) || {
    name: 'test',
    fileType: 'file'
  };
  return Object.assign({}, fileNode, {
    authenticated: state.user.authenticated
  });
}

const mapDispatchToProps = { ...FileActions, ...IDEActions };

const ConnectedFileNode = connect(
  mapStateToProps,
  mapDispatchToProps
)(FileNode);

export { FileNode };
export default ConnectedFileNode;
