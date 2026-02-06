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
import capturePreviewImage from '../utils/capturePreviewImage';

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

  async function saveSketch(cmController) {
    if (authenticated) {
      const previewImage = await capturePreviewImage();
      dispatch(
        saveProject(cmController?.getContent(), false, false, previewImage)
      );
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
