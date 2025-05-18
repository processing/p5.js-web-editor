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
  openUploadFileModal,
  openUploadImageByUrlModal
} from '../actions/ide';
import { selectRootFile } from '../selectors/files';
import { getAuthenticated, selectCanEditSketch } from '../selectors/users';

import ConnectedFileNode from './FileNode';
import { PlusIcon } from '../../../common/icons';
import { FileDrawer } from './Editor/MobileEditor';
import UploadMediaModal from './UploadMediaModal';
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
  const isAuthenticated = useSelector(getAuthenticated);
  const isUploadImageByUrlModalOpen = useSelector(
    (state) => state.ide.uploadImageByUrlModalVisible
  );

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
    if (projectOptionsVisible) {
      dispatch(closeProjectOptions());
    } else {
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
              tabIndex="0"
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
                {isAuthenticated && (
                  <li>
                    <button
                      aria-label={t('Sidebar.UploadFileARIA')}
                      onClick={() => {
                        dispatch(openUploadFileModal(rootFile.id));
                        setTimeout(() => dispatch(closeProjectOptions()), 300);
                      }}
                    >
                      {t('Sidebar.UploadFile')}
                    </button>
                  </li>
                )}
                {isAuthenticated && canEditProject && (
                  <li>
                    <button
                      aria-label={t('Sidebar.UploadImageByUrlARIA')}
                      onClick={() => {
                        dispatch(openUploadImageByUrlModal(rootFile.id));
                        setTimeout(() => dispatch(closeProjectOptions()), 300);
                      }}
                    >
                      {t('Sidebar.UploadImageByUrl')}
                    </button>
                  </li>
                )}
              </ul>
            )}
          </div>
        </header>
        <ConnectedFileNode id={rootFile.id} canEdit={canEditProject} />
        {isUploadImageByUrlModalOpen && (
          <UploadMediaModal
            onUploadSuccess={(s3Url) => {
              dispatch({
                type: 'ADD_SKETCH_FILE',
                payload: {
                  name: `image-${Date.now()}.jpg`,
                  url: s3Url,
                  parentId: rootFile.id
                }
              });
              dispatch({ type: 'CLOSE_UPLOAD_IMAGE_BY_URL_MODAL' });
            }}
            onClose={() =>
              dispatch({ type: 'CLOSE_UPLOAD_IMAGE_BY_URL_MODAL' })
            }
          />
        )}
      </section>
    </FileDrawer>
  );
}
