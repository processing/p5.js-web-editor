import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

const EditorAccessibility = React.memo(({ lintMessages = [], currentLine }) => {
  const { t } = useTranslation();
  const lineText = t('Editor.KeyUpLineNumber', { lineNumber: currentLine });

  return (
    <div className="editor-accessibility">
      <ul className="editor-lintmessages" title="lint messages">
        {lintMessages.length > 0 ? (
          lintMessages.map((lintMessage) => (
            <li key={lintMessage.id}>
              {lintMessage.severity} in line
              {lintMessage.line} :{lintMessage.message}
            </li>
          ))
        ) : (
          <li key={0}>{t('EditorAccessibility.NoLintMessages')}</li>
        )}
      </ul>
      <p>
        {' '}
        {t('EditorAccessibility.CurrentLine')}
        <span
          className="editor-linenumber"
          aria-live="polite"
          aria-atomic="true"
          id="current-line"
        >
          {lineText}
        </span>
      </p>
    </div>
  );
});

EditorAccessibility.propTypes = {
  lintMessages: PropTypes.arrayOf(
    PropTypes.shape({
      severity: PropTypes.oneOf(['error', 'hint', 'info', 'warning'])
        .isRequired,
      line: PropTypes.number.isRequired,
      message: PropTypes.string.isRequired,
      id: PropTypes.number.isRequired
    })
  ).isRequired,
  currentLine: PropTypes.number.isRequired
};

export default EditorAccessibility;
