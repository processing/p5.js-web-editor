import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  openPreferences,
  startAccessibleSketch,
  startSketch,
  stopSketch
} from '../../actions/ide';
import {
  setAutorefresh,
  setGridOutput,
  setTextOutput
} from '../../actions/preferences';

import PlayIcon from '../../../../images/play.svg';
import StopIcon from '../../../../images/stop.svg';
import PreferencesIcon from '../../../../images/preferences.svg';
import ProjectName from './ProjectName';

const Toolbar = (props) => {
  const { isPlaying, infiniteLoop, preferencesIsVisible } = useSelector(
    (state) => state.ide
  );
  const project = useSelector((state) => state.project);
  const autorefresh = useSelector((state) => state.preferences.autorefresh);
  const dispatch = useDispatch();

  const { t } = useTranslation();

  // for better ui in rtl
  const direction = useSelector((state) => state.preferences.direction);

  const playButtonClass = classNames(
    direction === 'rtl'
      ? {
          'rtl-toolbar__play-button': true,
          'rtl-toolbar__play-button--selected': isPlaying
        }
      : {
          'toolbar__play-button': true,
          'toolbar__play-button--selected': isPlaying
        }
  );
  const stopButtonClass = classNames(
    direction === 'rtl'
      ? {
          'rtl-toolbar__stop-button': true,
          'rtl-toolbar__stop-button--selected': !isPlaying
        }
      : {
          'toolbar__stop-button': true,
          'toolbar__stop-button--selected': !isPlaying
        }
  );
  const preferencesButtonClass = classNames(
    direction === 'rtl'
      ? {
          'rtl-toolbar__preferences-button': true,
          'rtl-toolbar__preferences-button--selected': preferencesIsVisible
        }
      : {
          'toolbar__preferences-button': true,
          'toolbar__preferences-button--selected': preferencesIsVisible
        }
  );

  return (
    <div className={direction === 'rtl' ? 'rtl-toolbar' : 'toolbar'}>
      <button
        className={
          direction === 'rtl'
            ? 'rtl-toolbar__play-sketch-button'
            : 'toolbar__play-sketch-button'
        }
        onClick={() => {
          props.syncFileContent();
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
        className={playButtonClass}
        id="play-sketch"
        onClick={() => {
          props.syncFileContent();
          dispatch(startSketch());
        }}
        aria-label={t('Toolbar.PlayOnlyVisualSketchARIA')}
        title={t('Toolbar.PlaySketchARIA')}
        disabled={infiniteLoop}
      >
        <PlayIcon focusable="false" aria-hidden="true" />
      </button>
      <button
        className={stopButtonClass}
        onClick={() => dispatch(stopSketch())}
        aria-label={t('Toolbar.StopSketchARIA')}
        title={t('Toolbar.StopSketchARIA')}
      >
        <StopIcon focusable="false" aria-hidden="true" />
      </button>
      <div
        className={
          direction === 'rtl'
            ? 'rtl-toolbar__autorefresh'
            : 'toolbar__autorefresh'
        }
      >
        <input
          id="autorefresh"
          className={
            direction === 'rtl'
              ? 'rtl-checkbox__autorefresh'
              : 'checkbox__autorefresh'
          }
          type="checkbox"
          checked={autorefresh}
          onChange={(event) => {
            dispatch(setAutorefresh(event.target.checked));
            if (event.target.checked) {
              dispatch(startSketch());
            }
          }}
        />
        <label
          htmlFor="autorefresh"
          className={
            direction === 'rtl'
              ? 'rtl-toolbar__autorefresh-label'
              : 'toolbar__autorefresh-label'
          }
        >
          {t('Toolbar.Auto-refresh')}
        </label>
      </div>
      <div
        className={
          direction === 'rtl'
            ? 'rtl-toolbar__project-name-container'
            : 'toolbar__project-name-container'
        }
      >
        <ProjectName />
        {(() => {
          if (project.owner) {
            return (
              <p
                className={
                  direction === 'rtl'
                    ? 'rtl-toolbar__project-project.owner'
                    : 'toolbar__project-project.owner'
                }
              >
                {t('Toolbar.By')}{' '}
                <Link to={`/${project.owner.username}/sketches`}>
                  {project.owner.username}
                </Link>
              </p>
            );
          }
          return null;
        })()}
      </div>
      <button
        className={preferencesButtonClass}
        onClick={() => dispatch(openPreferences())}
        aria-label={t('Toolbar.OpenPreferencesARIA')}
        title={t('Toolbar.OpenPreferencesARIA')}
      >
        <PreferencesIcon focusable="false" aria-hidden="true" />
      </button>
    </div>
  );
};

Toolbar.propTypes = {
  syncFileContent: PropTypes.func.isRequired
};

export default Toolbar;
