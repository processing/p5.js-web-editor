import PropTypes from 'prop-types';
import React, { useState, useRef } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { withTranslation } from 'react-i18next';

import * as IDEActions from '../actions/ide';
import * as FileActions from '../actions/files';
import DownArrowIcon from '../../../images/down-filled-triangle.svg';
import FolderRightIcon from '../../../images/triangle-arrow-right.svg';
import FolderDownIcon from '../../../images/triangle-arrow-down.svg';
import FileIcon from '../../../images/file.svg';

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

function FileNode(props) {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatedName, setUpdatedName] = useState(props.name);
  const fileNameInputRef = useRef(null);
  const fileOptionsRef = useRef(null);

  const onFocusComponent = () => {
    setIsFocused(true);
  };

  const hideFileOptions = () => {
    setIsOptionsOpen(false);
  };

  const hideEditFileName = () => {
    setIsEditingName(false);
  };

  const onBlurComponent = () => {
    setIsFocused(false);
    setTimeout(() => {
      if (!isFocused) {
        hideFileOptions();
      }
    }, 200);
  };

  const saveUpdatedFileName = () => {
    const { name, updateFileName, id } = props;
    if (updatedName !== name) {
      updateFileName(id, updatedName);
    }
  };

  const handleFileClick = (event) => {
    event.stopPropagation();
    const { id, setSelectedFile, name, onClickFile } = props;
    if (name !== 'root' && !isDeleting) {
      setSelectedFile(id);
    }

    // debugger; // eslint-disable-line
    if (onClickFile) {
      onClickFile();
    }
  };

  const validateFileName = () => {
    const currentName = props.name;
    const oldFileExtension = currentName.match(/\.[0-9a-z]+$/i);
    const newFileExtension = updatedName.match(/\.[0-9a-z]+$/i);
    const hasPeriod = updatedName.match(/\.+/);
    const hasNoExtension = oldFileExtension && !newFileExtension;
    const hasExtensionIfFolder = props.fileType === 'folder' && hasPeriod;
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
      notSameExtension ||
      hasOnlyExtension ||
      hasExtensionIfFolder
    ) {
      setUpdatedName(currentName);
    } else {
      saveUpdatedFileName();
    }
  };

  const handleFileNameChange = (event) => {
    const newName = event.target.value;
    setUpdatedName(newName);
  };

  const handleFileNameBlur = () => {
    validateFileName();
    hideEditFileName();
  };

  const showEditFileName = () => {
    setIsEditingName(true);
  };

  const handleClickRename = () => {
    setUpdatedName(props.name);
    showEditFileName();
    setTimeout(() => fileNameInputRef.current.focus(), 0);
    setTimeout(() => hideFileOptions(), 0);
  };

  const handleClickAddFile = () => {
    props.newFile(props.id);
    setTimeout(() => hideFileOptions(), 0);
  };

  const handleClickAddFolder = () => {
    props.newFolder(props.id);
    setTimeout(() => hideFileOptions(), 0);
  };

  const handleClickUploadFile = () => {
    props.openUploadFileModal(props.id);
    setTimeout(hideFileOptions, 0);
  };

  const handleClickDelete = () => {
    const prompt = props.t('Common.DeleteConfirmation', {
      name: props.name
    });

    if (window.confirm(prompt)) {
      setIsDeleting(true);
      props.resetSelectedFile(props.id);
      setTimeout(() => props.deleteFile(props.id, props.parentId), 100);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      hideEditFileName();
    }
  };

  const toggleFileOptions = (event) => {
    event.preventDefault();
    if (!props.canEdit) {
      return;
    }
    if (isOptionsOpen) {
      setIsOptionsOpen(false);
    } else {
      fileOptionsRef.current.focus();
      setIsOptionsOpen(true);
    }
  };

  const showFolderChildren = () => {
    props.showFolderChildren(props.id);
  };

  const hideFolderChildren = () => {
    props.hideFolderChildren(props.id);
  };

  const renderChild = (childId) => (
    <li key={childId}>
      <ConnectedFileNode
        id={childId}
        parentId={props.id}
        canEdit={props.canEdit}
        onClickFile={props.onClickFile}
      />
    </li>
  );

  const itemClass = classNames({
    'sidebar__root-item': props.name === 'root',
    'sidebar__file-item': props.name !== 'root',
    'sidebar__file-item--selected': props.isSelectedFile,
    'sidebar__file-item--open': isOptionsOpen,
    'sidebar__file-item--editing': isEditingName,
    'sidebar__file-item--closed': props.isFolderClosed
  });

  const isFile = props.fileType === 'file';
  const isFolder = props.fileType === 'folder';
  const isRoot = props.name === 'root';
  const { t } = props;

  return (
    <div className={itemClass}>
      {!isRoot && (
        <div className="file-item__content" onContextMenu={toggleFileOptions}>
          <span className="file-item__spacer"></span>
          {isFile && (
            <span className="sidebar__file-item-icon">
              <FileIcon focusable="false" aria-hidden="true" />
            </span>
          )}
          {isFolder && (
            <div className="sidebar__file-item--folder">
              <button
                className="sidebar__file-item-closed"
                onClick={showFolderChildren}
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
                onClick={hideFolderChildren}
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
            ref={fileNameInputRef}
            onBlur={handleFileNameBlur}
            onKeyPress={handleKeyPress}
          />
          <button
            className="sidebar__file-item-show-options"
            aria-label={t('FileNode.ToggleFileOptionsARIA')}
            ref={fileOptionsRef}
            tabIndex="0"
            onClick={toggleFileOptions}
            onBlur={onBlurComponent}
            onFocus={onFocusComponent}
          >
            <DownArrowIcon focusable="false" aria-hidden="true" />
          </button>
          <div className="sidebar__file-item-options">
            <ul title="file options">
              {isFolder && (
                <React.Fragment>
                  <li>
                    <button
                      aria-label={t('FileNode.AddFolderARIA')}
                      onClick={handleClickAddFolder}
                      onBlur={onBlurComponent}
                      onFocus={onFocusComponent}
                      className="sidebar__file-item-option"
                    >
                      {t('FileNode.AddFolder')}
                    </button>
                  </li>
                  <li>
                    <button
                      aria-label={t('FileNode.AddFileARIA')}
                      onClick={handleClickAddFile}
                      onBlur={onBlurComponent}
                      onFocus={onFocusComponent}
                      className="sidebar__file-item-option"
                    >
                      {t('FileNode.AddFile')}
                    </button>
                  </li>
                  {props.authenticated && (
                    <li>
                      <button
                        aria-label={t('FileNode.UploadFileARIA')}
                        onClick={handleClickUploadFile}
                        onBlur={onBlurComponent}
                        onFocus={onFocusComponent}
                      >
                        {t('FileNode.UploadFile')}
                      </button>
                    </li>
                  )}
                </React.Fragment>
              )}
              <li>
                <button
                  onClick={handleClickRename}
                  onBlur={onBlurComponent}
                  onFocus={onFocusComponent}
                  className="sidebar__file-item-option"
                >
                  {t('FileNode.Rename')}
                </button>
              </li>
              <li>
                <button
                  onClick={handleClickDelete}
                  onBlur={onBlurComponent}
                  onFocus={onFocusComponent}
                  className="sidebar__file-item-option"
                >
                  {t('FileNode.Delete')}
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
      {props.children && (
        <ul className="file-item__children">
          {props.children.map(renderChild)}
        </ul>
      )}
    </div>
  );
}

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
  t: PropTypes.func.isRequired,
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

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign(FileActions, IDEActions), dispatch);
}

const TranslatedFileNode = withTranslation()(FileNode);

const ConnectedFileNode = connect(
  mapStateToProps,
  mapDispatchToProps
)(TranslatedFileNode);

export { TranslatedFileNode as FileNode, ConnectedFileNode as default };
