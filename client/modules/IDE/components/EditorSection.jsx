import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import LeftArrowIcon from '../../../images/left-arrow.svg';
import RightArrowIcon from '../../../images/right-arrow.svg';
import UnsavedChangesDotIcon from '../../../images/unsaved-changes-dot.svg';
import { collapseSidebar, expandSidebar } from '../actions/ide';
import EditorAccessibility from '../components/EditorAccessibility';
import Timer from '../components/Timer';
// import { selectActiveFile } from '../selectors/files';
const selectActiveFile = () => 'fix';

function EditorSection({ children }) {
  const { t } = useTranslation();

  const dispatch = useDispatch();

  const sidebarIsExpanded = useSelector((state) => state.ide.sidebarIsExpanded);
  const currentFile = useSelector(selectActiveFile);
  const hasUnsavedChanges = useSelector((state) => state.ide.unsavedChanges);
  const lintMessages = useSelector(
    (state) => state.editorAccessibility.lintMessages
  );

  const editorSectionClass = classNames({
    editor: true,
    'sidebar--contracted': !sidebarIsExpanded
  });

  return (
    <section className={editorSectionClass}>
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
            {currentFile.name}
            <span className="editor__unsaved-changes">
              {hasUnsavedChanges ? (
                <UnsavedChangesDotIcon
                  role="img"
                  aria-label={t('Editor.UnsavedChangesARIA')}
                  focusable="false"
                />
              ) : null}
            </span>
          </span>
          <Timer />
        </div>
      </header>
      {children}
      <EditorAccessibility lintMessages={lintMessages} />
    </section>
  );
}

EditorSection.propTypes = {
  children: PropTypes.node.isRequired
};

export default EditorSection;
