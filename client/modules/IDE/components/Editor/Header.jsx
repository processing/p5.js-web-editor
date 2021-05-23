import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import UnsavedChangesDotIcon from '../../../../images/unsaved-changes-dot.svg';
import RightArrowIcon from '../../../../images/right-arrow.svg';
import LeftArrowIcon from '../../../../images/left-arrow.svg';
import Timer from '../Timer';
import { collapseSidebar, expandSidebar } from '../../actions/ide';

export default function Header(props) {
  const { fileName, isUserOwner } = props;
  const { t } = useTranslation();
  const projectSavedTime = useSelector((state) => state.project.updatedAt);
  const unsavedChanges = useSelector((state) => state.ide.unsavedChanges);
  const dispatch = useDispatch();
  return (
    <header className="editor__header">
      <button
        aria-label={t('Editor.OpenSketchARIA')}
        className="sidebar__contract"
        onClick={() => dispatch(collapseSidebar())}
      >
        <LeftArrowIcon focusable="false" aria-hidden="true" />
      </button>
      <button
        aria-label={t('Editor.CloseSketchARIA')}
        className="sidebar__expand"
        onClick={() => dispatch(expandSidebar())}
      >
        <RightArrowIcon focusable="false" aria-hidden="true" />
      </button>
      <div className="editor__file-name">
        <span>
          {fileName}
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
  fileName: PropTypes.string.isRequired,
  isUserOwner: PropTypes.bool.isRequired
};
