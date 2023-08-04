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

export const useSketchActions = () => {
  const unsavedChanges = useSelector((state) => state.ide.unsavedChanges);
  const authenticated = useSelector((state) => state.user.authenticated);
  const project = useSelector((state) => state.project);
  const currentUser = useSelector((state) => state.user.username);
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
    if (authenticated) {
      dispatch(saveProject(cmController?.getContent()));
    } else {
      dispatch(showErrorModal('forceAuthentication'));
    }
  }

  function downloadSketch() {
    dispatch(autosaveProject());
    dispatch(exportProjectAsZip(project.id));
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

  function canEditProjectName() {
    return (
      (project.owner &&
        project.owner.username &&
        project.owner.username === currentUser) ||
      !project.owner ||
      !project.owner.username
    );
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
