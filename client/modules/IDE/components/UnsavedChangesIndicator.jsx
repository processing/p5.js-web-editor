import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import UnsavedChangesDotIcon from '../../../images/unsaved-changes-dot.svg';

export default function UnsavedChangesIndicator() {
  const { t } = useTranslation();
  const hasUnsavedChanges = useSelector((state) => state.ide.unsavedChanges);

  if (!hasUnsavedChanges) {
    return null;
  }

  return (
    <span className="editor__unsaved-changes">
      <UnsavedChangesDotIcon
        role="img"
        aria-label={t('Editor.UnsavedChangesARIA')}
        focusable="false"
      />
    </span>
  );
}
