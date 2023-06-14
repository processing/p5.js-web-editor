import classNames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import StopIcon from '../../../../images/stop.svg';
import { stopSketch } from '../../actions/ide';

export default function StopButton() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const isPlaying = useSelector((state) => state.ide.isPlaying);

  return (
    <button
      className={classNames(
        'toolbar__stop-button',
        !isPlaying && 'toolbar__stop-button--selected'
      )}
      onClick={() => dispatch(stopSketch())}
      aria-label={t('Toolbar.StopSketchARIA')}
    >
      <StopIcon focusable="false" aria-hidden="true" />
    </button>
  );
}
