import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import UnsavedChangesDotIcon from '../../../images/unsaved-changes-dot.svg';
import RightArrowIcon from '../../../images/right-arrow.svg';
import LeftArrowIcon from '../../../images/left-arrow.svg';
import Timer from '../Timer';

export default function Header(props) {
  const {
    collapseSidebar,
    expandSidebar,
    file,
    unsavedChanges,
    projectSavedTime,
    isUserOwner
  } = props;
  const { t } = useTranslation();
  return (
    <header className="editor__header">
      <button
        aria-label={t('Editor.OpenSketchARIA')}
        className="sidebar__contract"
        onClick={collapseSidebar}
      >
        <LeftArrowIcon focusable="false" aria-hidden="true" />
      </button>
      <button
        aria-label={t('Editor.CloseSketchARIA')}
        className="sidebar__expand"
        onClick={expandSidebar}
      >
        <RightArrowIcon focusable="false" aria-hidden="true" />
      </button>
      <div className="editor__file-name">
        <span>
          {file.name}
          <span className="editor__unsaved-changes">
            {unsavedChanges ? (
              <UnsavedChangesDotIcon
                role="img"
                aria-label={t('Editor.UnsavedChangesARIA')}
                focusable="false"
              />
            ) : null}
          </span>
        </span>
        <Timer projectSavedTime={projectSavedTime} isUserOwner={isUserOwner} />
      </div>
    </header>
  );
}

Header.propTypes = {
  collapseSidebar: PropTypes.func.isRequired,
  expandSidebar: PropTypes.func.isRequired,
  file: PropTypes.shape({
    name: PropTypes.string.isRequired
  }).isRequired,
  unsavedChanges: PropTypes.bool.isRequired,
  projectSavedTime: PropTypes.string.isRequired,
  isUserOwner: PropTypes.bool.isRequired
};
