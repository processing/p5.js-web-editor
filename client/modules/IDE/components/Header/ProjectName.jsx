import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useSketchActions } from '../../hooks';
import { selectProjectName } from '../../selectors/project';
import EditableInput from '../EditableInput';

export default function ProjectName() {
  const { t } = useTranslation();

  const { changeSketchName, canEditProjectName } = useSketchActions();

  const projectName = useSelector(selectProjectName);

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
      onChange={changeSketchName}
    />
  );
}
