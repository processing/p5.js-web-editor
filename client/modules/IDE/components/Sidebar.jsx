import React, { useRef } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  closeProjectOptions,
  collapseSidebar,
  newFile,
  newFolder,
  openProjectOptions,
  openUploadFileModal
} from '../actions/ide';
import { selectRootFile } from '../selectors/files';
import { getAuthenticated, selectCanEditSketch } from '../selectors/users';

import ConnectedFileNode from './FileNode';
import { PlusIcon } from '../../../common/icons';
import { FileDrawer } from './Editor/MobileEditor';

// TODO: use a generic Dropdown UI component

export default function SideBar() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const rootFile = useSelector(selectRootFile);
  const ide = useSelector((state) => state.ide);
  const projectOptionsVisible = useSelector(
    (state) => state.ide.projectOptionsVisible
  );
  const isExpanded = useSelector((state) => state.ide.sidebarIsExpanded);
  const canEditProject = useSelector(selectCanEditSketch);

  const sidebarOptionsRef = useRef(null);

  const isAuthenticated = useSelector(getAuthenticated);

  const onBlurComponent = () => {
    setTimeout(() => dispatch(closeProjectOptions()), 200);
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
    <FileDrawer>
      {ide.sidebarIsExpanded && (
        <button
          data-backdrop="filedrawer"
          onClick={() => {
            dispatch(collapseSidebar());
            dispatch(closeProjectOptions());
          }}
        >
          {' '}
        </button>
      )}
      <section className={sidebarClass}>
        <header
          className="sidebar__header"
          onContextMenu={toggleProjectOptions}
        >
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
            >
              <PlusIcon focusable="false" aria-hidden="true" />
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
    </FileDrawer>
  );
}
