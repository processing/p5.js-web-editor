import { useCallback } from 'react';
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
import type { RootState } from '../../../reducers';

export const useSketchActions = () => {
  const unsavedChanges = useSelector(
    (state: RootState) => state.ide.unsavedChanges
  );
  const authenticated = useSelector(
    (state: RootState) => state.user.authenticated
  );
  const project = useSelector((state: RootState) => state.project);
  const user = useSelector((state: RootState) => state.user);
  const canEditProjectName = useSelector(selectCanEditSketch);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const params = useParams<{ username: string }>();

  const newSketch = useCallback(() => {
    if (!unsavedChanges) {
      dispatch(showToast('Toast.OpenedNewSketch'));
      dispatch(newProject());
    } else if (window.confirm(t('Nav.WarningUnsavedChanges'))) {
      dispatch(showToast('Toast.OpenedNewSketch'));
      dispatch(newProject());
    }
  }, [dispatch, showToast, newProject, unsavedChanges]);

  const saveSketch = useCallback(
    (cmController: { getContent: () => null | undefined }) => {
      if (authenticated) {
        dispatch(saveProject(cmController.getContent()));
      } else {
        dispatch(showErrorModal('forceAuthentication'));
      }
    },
    [dispatch, saveProject, showErrorModal, authenticated]
  );

  const downloadSketch = useCallback(() => {
    if (authenticated && user.id === project.owner.id) {
      dispatch(autosaveProject());
      exportProjectAsZip(project.id);
    }
  }, [
    dispatch,
    authenticated,
    autosaveProject,
    user,
    project,
    autosaveProject,
    exportProjectAsZip
  ]);

  const shareSketch = useCallback(() => {
    const { username } = params;
    dispatch(showShareModal(project.id, project.name, username));
  }, [params, dispatch, showShareModal, project]);

  const changeSketchName = useCallback(
    (name: string) => {
      const newProjectName = name.trim();
      if (newProjectName.length > 0) {
        dispatch(setProjectName(newProjectName));
        if (project.id) dispatch(saveProject());
      }
    },
    [dispatch, setProjectName, project.id, saveProject]
  );

  return {
    newSketch,
    saveSketch,
    downloadSketch,
    shareSketch,
    changeSketchName,
    canEditProjectName
  };
};
