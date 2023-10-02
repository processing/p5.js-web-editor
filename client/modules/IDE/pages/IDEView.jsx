import React, { useEffect, useRef, useState } from 'react';
import { useLocation, Prompt, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import SplitPane from 'react-split-pane';
import MediaQuery from 'react-responsive';
import IDEKeyHandlers from '../components/IDEKeyHandlers';
import Sidebar from '../components/Sidebar';
import PreviewFrame from '../components/PreviewFrame';
import Console from '../components/Console';
import Toast from '../components/Toast';
import { updateFileContent } from '../actions/files';
import { startSketch } from '../actions/ide';
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
import PuzzleView from '../pages/PuzzleView';

function getTitle(project) {
  const { id } = project;
  return id ? `p5.js Web Editor | ${project.name}` : 'p5.js Web Editor';
}

function isAuth(pathname) {
  return pathname === '/login' || pathname === '/signup';
}

function isOverlay(pathname) {
  return pathname === '/about' || pathname === '/feedback';
}

function WarnIfUnsavedChanges() {
  const hasUnsavedChanges = useSelector((state) => state.ide.unsavedChanges);

  const { t } = useTranslation();

  const currentLocation = useLocation();

  return (
    <Prompt
      when={hasUnsavedChanges}
      message={(nextLocation) => {
        if (
          isAuth(nextLocation.pathname) ||
          isAuth(currentLocation.pathname) ||
          isOverlay(nextLocation.pathname) ||
          isOverlay(currentLocation.pathname)
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
  const ide = useSelector((state) => state.ide);
  const preferences = useSelector((state) => state.preferences);
  const project = useSelector((state) => state.project);
  const isUserOwner = useSelector(getIsUserOwner);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const params = useParams();

  const [consoleSize, setConsoleSize] = useState(150);
  const [sidebarSize, setSidebarSize] = useState(160);
  const [isOverlayVisible, setIsOverlayVisible] = useState(true);

  const cmRef = useRef({});

  const autosaveIntervalRef = useRef(null);

  const syncFileContent = () => {
    const file = cmRef.current.getContent();
    dispatch(updateFileContent(file.id, file.content));
  };

  useEffect(() => {
    dispatch(clearPersistedState());

    dispatch(startSketch());
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
      <MediaQuery minWidth={770}>
        {(matches) =>
          matches ? (
            <main className="editor-preview-container">
              <SplitPane
                split="vertical"
                size={ide.sidebarIsExpanded ? sidebarSize : 20}
                minSize={125}
              >
                <Sidebar />
                <SplitPane split="vertical" defaultSize="50%">
                  <PuzzleView />
                  <SplitPane
                    className="IDE-view"
                    split="horizontal"
                    defaultSize="50%"
                  >
                    <SplitPane
                      split="vertical"
                      primary="second"
                      size={ide.consoleIsExpanded ? consoleSize : 29}
                      minSize={29}
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
                        <h2 className="preview-frame__title">Output</h2>
                      </header>
                      <div className="preview-frame__content">
                        <div
                          className="preview-frame-overlay"
                          style={{
                            display: isOverlayVisible ? 'block' : 'none'
                          }}
                        />
                        <div>
                          {((preferences.textOutput ||
                            preferences.gridOutput) &&
                            ide.isPlaying) ||
                            ide.isAccessibleOutputPlaying}
                        </div>
                        <PreviewFrame cmController={cmRef.current} />
                      </div>
                    </section>
                  </SplitPane>
                </SplitPane>
              </SplitPane>
            </main>
          ) : (
            <>
              <FloatingActionButton syncFileContent={syncFileContent} />
              <PreviewWrapper show={ide.isPlaying}>
                <SplitPane
                  style={{ position: 'static' }}
                  split="horizontal"
                  primary="second"
                  minSize={200}
                >
                  <PreviewFrame
                    fullView
                    hide={!ide.isPlaying}
                    cmController={cmRef.current}
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
          )
        }
      </MediaQuery>
      <IDEOverlays />
    </RootPage>
  );
};

export default IDEView;
