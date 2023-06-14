import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import PlayIcon from '../../../../images/play.svg';
import { startAccessibleSketch, startSketch } from '../../actions/ide';
import { setGridOutput, setTextOutput } from '../../actions/preferences';

export default function PlayButton({ syncFileContent }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const isPlaying = useSelector((state) => state.ide.isPlaying);
  const infiniteLoop = useSelector((state) => state.ide.infiniteLoop);

  return (
    <>
      <button
        className="toolbar__play-sketch-button"
        onClick={() => {
          syncFileContent();
          dispatch(startAccessibleSketch());
          dispatch(setTextOutput(true));
          dispatch(setGridOutput(true));
        }}
        aria-label={t('Toolbar.PlaySketchARIA')}
        disabled={infiniteLoop}
      >
        <PlayIcon focusable="false" aria-hidden="true" />
      </button>
      <button
        className={classNames(
          'toolbar__play-button',
          isPlaying && 'toolbar__play-button--selected'
        )}
        onClick={() => {
          syncFileContent();
          dispatch(startSketch());
        }}
        aria-label={t('Toolbar.PlayOnlyVisualSketchARIA')}
        disabled={infiniteLoop}
      >
        <PlayIcon focusable="false" aria-hidden="true" />
      </button>
    </>
  );
}

PlayButton.propTypes = {
  syncFileContent: PropTypes.func.isRequired
};
