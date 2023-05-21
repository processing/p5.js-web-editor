import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import beepUrl from '../../../sounds/audioAlert.mp3';

// TODO: need to pass down the line number (or store in redux) instead of modifying the DOM.

const EditorAccessibility = ({ lintMessages = [] }) => {
  const { t } = useTranslation();

  const audioWarningEnabled = useSelector(
    (state) => state.preferences.lintWarning
  );

  // const lintMessages = useSelector((state) => state.editorAccessibility.lintMessages);

  const beep = useRef(new Audio(beepUrl));

  useEffect(() => {
    if (audioWarningEnabled && lintMessages.length > 0) {
      beep.play();
      // TODO: check that this works.
    }
  }, [beep, lintMessages, audioWarningEnabled]);

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
          {' '}
        </span>
      </p>
    </div>
  );
};

EditorAccessibility.propTypes = {
  lintMessages: PropTypes.arrayOf(
    PropTypes.shape({
      severity: PropTypes.string.isRequired,
      line: PropTypes.number.isRequired,
      message: PropTypes.string.isRequired,
      id: PropTypes.number.isRequired
    })
  ).isRequired
};

export default EditorAccessibility;
