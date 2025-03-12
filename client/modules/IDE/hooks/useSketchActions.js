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
import { showToast } from '../actions/toast';
import { showErrorModal, showShareModal } from '../actions/ide';
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
  const preferences = useSelector((state) => state.preferences);
  function newSketch() {
    dispatch(showToast('Toast.OpenedNewSketch'));

    if (authenticated && preferences.autosave) {
      dispatch(newProject());
      dispatch(autosaveProject());

      // Delay the second toast message to prevent overlap
      setTimeout(() => {
        dispatch(showToast('Toast.AutosaveEnabled'));
      }, 1000);
    } else if (
      !unsavedChanges ||
      window.confirm(t('Nav.WarningUnsavedChanges'))
    ) {
      dispatch(newProject());
    }
  }

  function saveSketch(cmController) {
    if (authenticated) {
      dispatch(saveProject(cmController?.getContent()));
    } else {
      dispatch(showErrorModal('forceAuthentication'));
    }
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
