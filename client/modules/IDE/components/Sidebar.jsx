import React, { useRef, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import {
  closeProjectOptions,
  newFile,
  newFolder,
  openProjectOptions,
  openUploadFileModal
} from '../actions/ide';
import { selectRootFile } from '../selectors/files';
import { getAuthenticated, selectCanEditSketch } from '../selectors/users';
import { remSize } from '../../../theme';
import ConnectedFileNode from './FileNode';

import DownArrowIcon from '../../../images/down-filled-triangle.svg';

const SidebarHeader = styled.header`
  padding-right: ${remSize(6)};
  padding-left: ${remSize(19)};
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: ${remSize(29)};
  min-height: ${remSize(29)};
  position: relative;
`;

const SidebarTitle = styled.h3`
  font-size: ${remSize(12)};
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
`;

const SidebarIcons = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
`;

const SidebarAddButton = styled.button`
  width: ${remSize(20)};
  height: ${remSize(20)};
  & svg {
    width: ${remSize(10)};
  }
`;

const SidebarProjectOptions = styled.ul`
  display: flex;
  width: 100%;
  max-width: ${remSize(180)};
`;
// TODO: use a generic Dropdown UI component

export default function SideBar() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [isFocused, setIsFocused] = useState(false);

  const rootFile = useSelector(selectRootFile);
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
      <SidebarHeader onContextMenu={toggleProjectOptions}>
        {isExpanded && (
          <SidebarTitle>
            <span>{t('Sidebar.Title')}</span>
          </SidebarTitle>
        )}
        {canEditProject && (
          <SidebarIcons>
            {isExpanded && (
              <SidebarAddButton
                aria-label={t('Sidebar.ToggleARIA')}
                tabIndex="0"
                ref={sidebarOptionsRef}
                onClick={toggleProjectOptions}
                onBlur={onBlurComponent}
                onFocus={onFocusComponent}
              >
                <DownArrowIcon focusable="false" aria-hidden="true" />
              </SidebarAddButton>
            )}
            {projectOptionsVisible && (
              <SidebarProjectOptions className="sidebar__project-options">
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
              </SidebarProjectOptions>
            )}
          </SidebarIcons>
        )}
      </SidebarHeader>
      <ConnectedFileNode id={rootFile.id} canEdit={canEditProject} />
    </section>
  );
}
