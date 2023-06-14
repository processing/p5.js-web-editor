import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { saveProject, setProjectName } from '../../actions/project';
import { selectProjectId, selectProjectName } from '../../selectors/project';
import { selectCanEditSketch } from '../../selectors/users';
import EditableInput from '../EditableInput';

export default function EditableProjectName() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const projectId = useSelector(selectProjectId);
  const projectName = useSelector(selectProjectName);
  const canEditProjectName = useSelector(selectCanEditSketch);

  const handleProjectNameSave = (value) => {
    const newProjectName = value.trim();
    dispatch(setProjectName(newProjectName));
    if (projectId) {
      dispatch(saveProject());
    }
  };

  return (
    <EditableInput
      value={projectName}
      disabled={!canEditProjectName}
      aria-label={t('Toolbar.EditSketchARIA')}
      inputProps={{
        maxLength: 128,
        'aria-label': t('Toolbar.NewSketchNameARIA')
      }}
      validate={(text) => text.trim().length > 0}
      onChange={handleProjectNameSave}
    />
  );
}
