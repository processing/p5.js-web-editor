import React, { useRef, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  closeProjectOptions,
  newFile,
  newFolder,
  openProjectOptions,
  openUploadFileModal
} from '../actions/ide';
import { getAuthenticated, selectCanEditSketch } from '../selectors/users';

import ConnectedFileNode from './FileNode';

import DownArrowIcon from '../../../images/down-filled-triangle.svg';

// TODO: use a generic Dropdown UI component

export default function SideBar() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [isFocused, setIsFocused] = useState(false);

  const files = useSelector((state) => state.files);
  // TODO: use `selectRootFile` defined in another PR
  const rootFile = files.filter((file) => file.name === 'root')[0];
  const projectOptionsVisible = useSelector(
    (state) => state.ide.projectOptionsVisible
  );
  const isExpanded = useSelector((state) => state.ide.sidebarIsExpanded);
  const canEditProject = useSelector(selectCanEditSketch);
  const isAuthenticated = useSelector(getAuthenticated);

  const sidebarOptionsRef = useRef(null);

  const onBlurComponent = () => {
    setIsFocused(false);
    setTimeout(() => {
      if (!isFocused) {
        dispatch(closeProjectOptions());
      }
    }, 200);
  };

  const onFocusComponent = () => {
    setIsFocused(true);
  };

  const toggleProjectOptions = (e) => {
    e.preventDefault();
    if (projectOptionsVisible) {
      dispatch(closeProjectOptions());
    } else {
      sidebarOptionsRef.current?.focus();
      dispatch(openProjectOptions());
    }
  };

  const sidebarClass = classNames({
    sidebar: true,
    'sidebar--contracted': !isExpanded,
    'sidebar--project-options': projectOptionsVisible,
    'sidebar--cant-edit': !canEditProject
  });

  return (
    <section className={sidebarClass}>
      <header className="sidebar__header" onContextMenu={toggleProjectOptions}>
        <h3 className="sidebar__title">
          <span>{t('Sidebar.Title')}</span>
        </h3>
        <div className="sidebar__icons">
          <button
            aria-label={t('Sidebar.ToggleARIA')}
            className="sidebar__add"
            tabIndex="0"
            ref={sidebarOptionsRef}
            onClick={toggleProjectOptions}
            onBlur={onBlurComponent}
            onFocus={onFocusComponent}
          >
            <DownArrowIcon focusable="false" aria-hidden="true" />
          </button>
          <ul className="sidebar__project-options">
            <li>
              <button
                aria-label={t('Sidebar.AddFolderARIA')}
                onClick={() => {
                  dispatch(newFolder(rootFile.id));
                  setTimeout(() => dispatch(closeProjectOptions()), 0);
                }}
                onBlur={onBlurComponent}
                onFocus={onFocusComponent}
              >
                {t('Sidebar.AddFolder')}
              </button>
            </li>
            <li>
              <button
                aria-label={t('Sidebar.AddFileARIA')}
                onClick={() => {
                  dispatch(newFile(rootFile.id));
                  setTimeout(() => dispatch(closeProjectOptions()), 0);
                }}
                onBlur={onBlurComponent}
                onFocus={onFocusComponent}
              >
                {t('Sidebar.AddFile')}
              </button>
            </li>
            {isAuthenticated && (
              <li>
                <button
                  aria-label={t('Sidebar.UploadFileARIA')}
                  onClick={() => {
                    dispatch(openUploadFileModal(rootFile.id));
                    setTimeout(() => dispatch(closeProjectOptions()), 0);
                  }}
                  onBlur={onBlurComponent}
                  onFocus={onFocusComponent}
                >
                  {t('Sidebar.UploadFile')}
                </button>
              </li>
            )}
          </ul>
        </div>
      </header>
      <ConnectedFileNode id={rootFile.id} canEdit={canEditProject} />
    </section>
  );
}
