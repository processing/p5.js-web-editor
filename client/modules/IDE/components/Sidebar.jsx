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
import { selectRootFile } from '../selectors/files';
import { getSketchOwner } from '../selectors/users';

import ConnectedFileNode from './FileNode';

import DownArrowIcon from '../../../images/down-filled-triangle.svg';

export default function Sidebar() {
  const { t } = useTranslation();

  const dispatch = useDispatch();

  const [isFocused, setIsFocused] = useState(false);

  const onBlurComponent = () => {
    setIsFocused(false);
    setTimeout(() => {
      if (!isFocused) {
        dispatch(closeProjectOptions());
      }
    }, 200);
  };

  const onFocusComponent = () => setIsFocused(true);

  const rootFile = useSelector(selectRootFile);

  const projectOptionsVisible = useSelector(
    (state) => state.ide.projectOptionsVisible
  );

  const toggleRef = useRef(null);

  const toggleProjectOptions = (e) => {
    e.preventDefault();
    if (projectOptionsVisible) {
      dispatch(closeProjectOptions());
    } else {
      toggleRef.current?.focus();
      dispatch(openProjectOptions());
    }
  };

  const user = useSelector((state) => state.user);
  const owner = useSelector(getSketchOwner);

  const canEditProject = !owner || (user.authenticated && owner.id === user.id);

  const isExpanded = useSelector((state) => state.ide.sidebarIsExpanded);

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
            ref={toggleRef}
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
            {user.authenticated && (
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
