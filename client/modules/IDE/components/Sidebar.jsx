import React, { useRef, useEffect } from 'react';
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
import { PlusIcon, LockIcon } from '../../../common/icons';
import { FileDrawer } from './Editor/MobileEditor';

export default function SideBar() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const rootFile = useSelector(selectRootFile);
  const projectOptionsVisible = useSelector(
    (state) => state.ide.projectOptionsVisible
  );
  const isExpanded = useSelector((state) => state.ide.sidebarIsExpanded);
  const canEditProject = useSelector(selectCanEditSketch);
  const isAuthenticated = useSelector(getAuthenticated);

  const sidebarOptionsRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        projectOptionsVisible &&
        sidebarOptionsRef.current &&
        !sidebarOptionsRef.current.contains(event.target)
      ) {
        setTimeout(() => dispatch(closeProjectOptions()), 300);
      }
    }

    if (projectOptionsVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [projectOptionsVisible, dispatch]);

  const toggleProjectOptions = (e) => {
    e.preventDefault();
    if (projectOptionsVisible) dispatch(closeProjectOptions());
    else dispatch(openProjectOptions());
  };

  const sidebarClass = classNames({
    sidebar: true,
    'sidebar--contracted': !isExpanded,
    'sidebar--project-options': projectOptionsVisible,
    'sidebar--cant-edit': !canEditProject
  });

  return (
    <FileDrawer>
      {isExpanded && (
        <button
          data-backdrop="filedrawer"
          onClick={() => {
            dispatch(collapseSidebar());
            dispatch(closeProjectOptions());
          }}
        />
      )}
      <section className={sidebarClass}>
        <header
          className="sidebar__header"
          onContextMenu={toggleProjectOptions}
        >
          <h3 className="sidebar__title">
            <span>{t('Sidebar.Title')}</span>
          </h3>
          <div className="sidebar__icons" ref={sidebarOptionsRef}>
            <button
              aria-label={t('Sidebar.ToggleARIA')}
              className="sidebar__add"
              tabIndex={0}
              onClick={toggleProjectOptions}
            >
              <PlusIcon focusable="false" aria-hidden="true" />
            </button>
            {projectOptionsVisible && (
              <ul className="sidebar__project-options">
                <li>
                  <button
                    aria-label={t('Sidebar.AddFolderARIA')}
                    onClick={() => {
                      dispatch(newFolder(rootFile.id));
                      setTimeout(() => dispatch(closeProjectOptions()), 300);
                    }}
                  >
                    {t('Sidebar.AddFolder')}
                  </button>
                </li>
                <li>
                  <button
                    aria-label={t('Sidebar.AddFileARIA')}
                    onClick={() => {
                      dispatch(newFile(rootFile.id));
                      setTimeout(() => dispatch(closeProjectOptions()), 300);
                    }}
                  >
                    {t('Sidebar.AddFile')}
                  </button>
                </li>
                <li>
                  <button
                    disabled={!isAuthenticated}
                    className={classNames({
                      'tooltipped-login': !isAuthenticated
                    })}
                    aria-label={
                      isAuthenticated
                        ? t('Sidebar.UploadFileARIA')
                        : t('Sidebar.UploadFileRequiresLogin')
                    }
                    onClick={() => {
                      if (isAuthenticated) {
                        dispatch(openUploadFileModal(rootFile.id));
                        setTimeout(() => dispatch(closeProjectOptions()), 300);
                      }
                    }}
                  >
                    {!isAuthenticated && (
                      <span className="sidebar__lock-icon">
                        <LockIcon focusable="false" aria-hidden="true" />
                      </span>
                    )}
                    {t('Sidebar.UploadFile')}
                    {!isAuthenticated && (
                      <span className="tooltipped-login-tooltip">
                        {t('Sidebar.UploadFileRequiresLogin')}
                      </span>
                    )}
                  </button>
                </li>
              </ul>
            )}
          </div>
        </header>
        <ConnectedFileNode id={rootFile.id} canEdit={canEditProject} />
      </section>
    </FileDrawer>
  );
}
