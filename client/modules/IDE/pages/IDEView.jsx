import React, { useEffect, useRef, useState } from 'react';
import { useLocation, Prompt, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import SplitPane from 'react-split-pane';
import IDEKeyHandlers from '../components/IDEKeyHandlers';
import Sidebar from '../components/Sidebar';
import PreviewFrame from '../components/PreviewFrame';
import Console from '../components/Console';
import Toast from '../components/Toast';
import { updateFileContent } from '../actions/files';

import {
  autosaveProject,
  clearPersistedState,
  getProject
} from '../actions/project';
import { getIsUserOwner } from '../selectors/users';
import RootPage from '../../../components/RootPage';
import Header from '../components/Header';
import FloatingActionButton from '../components/FloatingActionButton';
import Editor from '../components/Editor';
import {
  EditorSidebarWrapper,
  PreviewWrapper
} from '../components/Editor/MobileEditor';
import IDEOverlays from '../components/IDEOverlays';
import useIsMobile from '../hooks/useIsMobile';

function getTitle(project) {
  const { id } = project;
  return id ? `p5.js Web Editor | ${project.name}` : 'p5.js Web Editor';
}

function isAuth(pathname) {
  return pathname === '/login' || pathname === '/signup';
}

function isOverlay(pathname) {
  return pathname === '/feedback';
}

function WarnIfUnsavedChanges() {
  const hasUnsavedChanges = useSelector((state) => state.ide.unsavedChanges);

  const { t } = useTranslation();

  const currentLocation = useLocation();

  // beforeunload handles closing or refreshing the window.
  useEffect(() => {
    const handleUnload = (e) => {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event#browser_compatibility
      e.preventDefault();
      e.returnValue = t('Nav.WarningUnsavedChanges');
    };

    if (hasUnsavedChanges) {
      window.addEventListener('beforeunload', handleUnload);
    } else {
      window.removeEventListener('beforeunload', handleUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [t, hasUnsavedChanges]);

  // Prompt handles internal navigation between pages.
  return (
    <Prompt
      when={hasUnsavedChanges}
      message={(nextLocation) => {
        if (
          isAuth(nextLocation.pathname) ||
          isAuth(currentLocation.pathname) ||
          isOverlay(nextLocation.pathname) ||
          isOverlay(currentLocation.pathname) ||
          nextLocation.state?.confirmed
        ) {
          return true; // allow navigation
        }
        return t('Nav.WarningUnsavedChanges');
      }}
    />
  );
}

export const CmControllerContext = React.createContext({});

const IDEView = () => {
  const isMobile = useIsMobile();
  const ide = useSelector((state) => state.ide);
  const preferences = useSelector((state) => state.preferences);
  const project = useSelector((state) => state.project);
  const isUserOwner = useSelector(getIsUserOwner);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const params = useParams();

  const [consoleSize, setConsoleSize] = useState(150);
  const [sidebarSize, setSidebarSize] = useState(160);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [MaxSize, setMaxSize] = useState(window.innerWidth);

  const cmRef = useRef({});

  const autosaveIntervalRef = useRef(null);

  const syncFileContent = () => {
    const file = cmRef.current.getContent();
    dispatch(updateFileContent(file.id, file.content));
  };

  useEffect(() => {
    dispatch(clearPersistedState());
  }, [dispatch]);

  useEffect(() => {
    const { project_id: id, username } = params;
    if (id && project.id !== id) {
      dispatch(getProject(id, username));
    }
  }, [dispatch, params, project.id]);

  const autosaveAllowed = isUserOwner && project.id && preferences.autosave;
  const shouldAutosave = autosaveAllowed && ide.unsavedChanges;

  // For autosave - send to API after 5 seconds without changes
  useEffect(() => {
    const handleAutosave = () => {
      dispatch(autosaveProject());
    };

    if (autosaveIntervalRef.current) {
      clearTimeout(autosaveIntervalRef.current);
    }

    if (shouldAutosave) {
      autosaveIntervalRef.current = setTimeout(handleAutosave, 5000);
    }

    return () => {
      if (autosaveIntervalRef.current) {
        clearTimeout(autosaveIntervalRef.current);
      }
    };
  }, [shouldAutosave, dispatch]);
  useEffect(() => {
    const updateInnerWidth = (e) => {
      setMaxSize(e.target.innerWidth);
    };

    window.addEventListener('resize', updateInnerWidth);

    return () => {
      window.removeEventListener('resize', updateInnerWidth);
    };
  }, [setMaxSize]);

  const consoleCollapsedSize = 29;
  const currentConsoleSize = ide.consoleIsExpanded
    ? consoleSize
    : consoleCollapsedSize;

  return (
    <RootPage>
      <Helmet>
        <title>{getTitle(project)}</title>
      </Helmet>
      <IDEKeyHandlers getContent={() => cmRef.current?.getContent()} />
      <WarnIfUnsavedChanges />
      <Toast />
      <CmControllerContext.Provider value={cmRef}>
        <Header syncFileContent={syncFileContent} />
      </CmControllerContext.Provider>
      {isMobile ? (
        <>
          <FloatingActionButton
            syncFileContent={syncFileContent}
            offsetBottom={ide.isPlaying ? currentConsoleSize : 0}
          />
          <PreviewWrapper show={ide.isPlaying}>
            <SplitPane
              style={{ position: 'static' }}
              split="horizontal"
              primary="second"
              size={currentConsoleSize}
              minSize={consoleCollapsedSize}
              onChange={(size) => {
                setConsoleSize(size);
                setIsOverlayVisible(true);
              }}
              onDragFinished={() => {
                setIsOverlayVisible(false);
              }}
              allowResize={ide.consoleIsExpanded}
              className="editor-preview-subpanel"
            >
              <PreviewFrame
                fullView
                hide={!ide.isPlaying}
                cmController={cmRef.current}
                isOverlayVisible={isOverlayVisible}
              />
              <Console />
            </SplitPane>
          </PreviewWrapper>
          <EditorSidebarWrapper show={!ide.isPlaying}>
            <Sidebar />
            <Editor
              provideController={(ctl) => {
                cmRef.current = ctl;
              }}
            />
          </EditorSidebarWrapper>
        </>
      ) : (
        <main className="editor-preview-container">
          <SplitPane
            split="vertical"
            size={ide.sidebarIsExpanded ? sidebarSize : 20}
            onChange={(size) => {
              setSidebarSize(size);
            }}
            allowResize={ide.sidebarIsExpanded}
            minSize={150}
          >
            <Sidebar />
            <SplitPane
              split="vertical"
              maxSize={MaxSize * 0.965}
              defaultSize="50%"
              onChange={() => {
                setIsOverlayVisible(true);
              }}
              onDragFinished={() => {
                setIsOverlayVisible(false);
              }}
              resizerStyle={{
                borderLeftWidth: '2px',
                borderRightWidth: '2px',
                width: '2px',
                margin: '0px 0px'
              }}
            >
              <SplitPane
                split="horizontal"
                primary="second"
                size={currentConsoleSize}
                minSize={consoleCollapsedSize}
                onChange={(size) => {
                  setConsoleSize(size);
                }}
                allowResize={ide.consoleIsExpanded}
                className="editor-preview-subpanel"
              >
                <Editor
                  provideController={(ctl) => {
                    cmRef.current = ctl;
                  }}
                />
                <Console />
              </SplitPane>
              <section className="preview-frame-holder">
                <header className="preview-frame__header">
                  <h2 className="preview-frame__title">
                    {t('Toolbar.Preview')}
                  </h2>
                </header>
                <div className="preview-frame__content">
                  <PreviewFrame
                    cmController={cmRef.current}
                    isOverlayVisible={isOverlayVisible}
                  />
                </div>
              </section>
            </SplitPane>
          </SplitPane>
        </main>
      )}
      <IDEOverlays />
    </RootPage>
  );
};

export default IDEView;
