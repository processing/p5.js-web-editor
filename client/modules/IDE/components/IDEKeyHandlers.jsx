import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { updateFileContent } from '../actions/files';
import {
  collapseConsole,
  collapseSidebar,
  expandConsole,
  expandSidebar,
  showErrorModal,
  startSketch,
  stopSketch,
  newFile
} from '../actions/ide';
import { setAllAccessibleOutput } from '../actions/preferences';
import { cloneProject, saveProject } from '../actions/project';
import useKeyDownHandlers from '../../../common/useKeyDownHandlers';
import {
  getAuthenticated,
  getIsUserOwner,
  getSketchOwner
} from '../selectors/users';

export const useIDEKeyHandlers = ({ getContent }) => {
  const dispatch = useDispatch();

  const sidebarIsExpanded = useSelector((state) => state.ide.sidebarIsExpanded);
  const consoleIsExpanded = useSelector((state) => state.ide.consoleIsExpanded);

  const rootFile = useSelector(
    (state) => state.files.filter((file) => file.name === 'root')[0]
  );

  const isUserOwner = useSelector(getIsUserOwner);
  const isAuthenticated = useSelector(getAuthenticated);
  const sketchOwner = useSelector(getSketchOwner);

  const syncFileContent = () => {
    const file = getContent();
    dispatch(updateFileContent(file.id, file.content));
  };

  useKeyDownHandlers({
    'ctrl-s': (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (isUserOwner || (isAuthenticated && !sketchOwner)) {
        dispatch(saveProject(getContent()));
      } else if (isAuthenticated) {
        dispatch(cloneProject());
      } else {
        dispatch(showErrorModal('forceAuthentication'));
      }
    },
    'ctrl-shift-enter': (e) => {
      e.preventDefault();
      e.stopPropagation();
      dispatch(stopSketch());
    },
    'ctrl-enter': (e) => {
      e.preventDefault();
      e.stopPropagation();
      syncFileContent();
      dispatch(startSketch());
    },
    'ctrl-shift-1': (e) => {
      e.preventDefault();
      dispatch(setAllAccessibleOutput(true));
    },
    'ctrl-shift-2': (e) => {
      e.preventDefault();
      dispatch(setAllAccessibleOutput(false));
    },
    'ctrl-b': (e) => {
      e.preventDefault();
      dispatch(
        // TODO: create actions 'toggleConsole', 'toggleSidebar', etc.
        sidebarIsExpanded ? collapseSidebar() : expandSidebar()
      );
    },
    'ctrl-alt-n': (e) => {
      e.preventDefault();
      e.stopPropagation();
      dispatch(newFile(rootFile.id));
    },
    'ctrl-`': (e) => {
      e.preventDefault();
      dispatch(consoleIsExpanded ? collapseConsole() : expandConsole());
    }
  });
};

const IDEKeyHandlers = ({ getContent }) => {
  useIDEKeyHandlers({ getContent });
  return null;
};

// Most actions can be accessed via redux, but those involving the cmController
// must be provided via props.
IDEKeyHandlers.propTypes = {
  getContent: PropTypes.func.isRequired
};

export default IDEKeyHandlers;
