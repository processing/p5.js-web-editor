import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import {
  autosaveProject,
  exportProjectAsZip,
  newProject,
  saveProject,
  setProjectName
} from '../actions/project';
import { updateFileContent } from '../actions/files';
import { showToast } from '../actions/toast';
import {
  openSaveAsCopyModal,
  showErrorModal,
  showShareModal
} from '../actions/ide';
import { selectCanEditSketch } from '../selectors/users';

const useSketchActions = () => {
  const unsavedChanges = useSelector((state) => state.ide.unsavedChanges);
  const authenticated = useSelector((state) => state.user.authenticated);
  const project = useSelector((state) => state.project);
  const user = useSelector((state) => state.user);
  const canEditProjectName = useSelector(selectCanEditSketch);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const params = useParams();

  function newSketch() {
    if (!unsavedChanges) {
      dispatch(showToast('Toast.OpenedNewSketch'));
      dispatch(newProject());
    } else if (window.confirm(t('Nav.WarningUnsavedChanges'))) {
      dispatch(showToast('Toast.OpenedNewSketch'));
      dispatch(newProject());
    }
  }

  function saveSketch(cmController) {
    if (!authenticated) {
      dispatch(showErrorModal('forceAuthentication'));
      return;
    }
    if (canEditProjectName) {
      dispatch(saveProject(cmController?.getContent()));
      return;
    }
    // Signed-in user who doesn't own this sketch: offer to save a copy.
    // The editor syncs to redux with a debounce, so push the live content
    // now so the copy includes the latest keystrokes.
    const file = cmController?.getContent();
    if (file) {
      dispatch(updateFileContent(file.id, file.content));
    }
    dispatch(openSaveAsCopyModal());
  }

  function downloadSketch() {
    if (authenticated && user.id === project.owner.id) {
      dispatch(autosaveProject());
      exportProjectAsZip(project.id);
    }
  }

  function shareSketch() {
    const { username } = params;
    dispatch(showShareModal(project.id, project.name, username));
  }

  function changeSketchName(name) {
    const newProjectName = name.trim();
    if (newProjectName.length > 0) {
      dispatch(setProjectName(newProjectName));
      if (project.id) dispatch(saveProject());
    }
  }

  return {
    newSketch,
    saveSketch,
    downloadSketch,
    shareSketch,
    changeSketchName,
    canEditProjectName
  };
};

export default useSketchActions;
