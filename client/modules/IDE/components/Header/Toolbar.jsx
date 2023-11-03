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
  setTextOutput,
  setTheme
} from '../../actions/preferences';

import PlayIcon from '../../../../images/play.svg';
import StopIcon from '../../../../images/stop.svg';
import PreferencesIcon from '../../../../images/preferences.svg';
import MoonIcon from '../../../../images/moon.svg';
import SunIcon from '../../../../images/sun.svg';
import ProjectName from './ProjectName';

const Toolbar = (props) => {
  const { isPlaying, infiniteLoop, preferencesIsVisible } = useSelector(
    (state) => state.ide
  );
  const project = useSelector((state) => state.project);
  const autorefresh = useSelector((state) => state.preferences.autorefresh);
  const dispatch = useDispatch();

  const { theme } = useSelector((state) => state.preferences);

  const handleThemeChange = (newTheme) => {
    dispatch(setTheme(newTheme));
  };

  const { t } = useTranslation();
  const playButtonClass = classNames({
    'toolbar__play-button': true,
    'toolbar__play-button--selected': isPlaying
  });
  const stopButtonClass = classNames({
    'toolbar__stop-button': true,
    'toolbar__stop-button--selected': !isPlaying
  });
  const preferencesButtonClass = classNames({
    'toolbar__preferences-button': true,
    'toolbar__preferences-button--selected': preferencesIsVisible
  });
  return (
    <div className="toolbar">
      <button
        className="toolbar__play-sketch-button"
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
      <div className="toolbar__autorefresh">
        <input
          id="autorefresh"
          className="checkbox__autorefresh"
          type="checkbox"
          checked={autorefresh}
          onChange={(event) => {
            dispatch(setAutorefresh(event.target.checked));
          }}
        />
        <label htmlFor="autorefresh" className="toolbar__autorefresh-label">
          {t('Toolbar.Auto-refresh')}
        </label>
      </div>
      <div className="toolbar__project-name-container">
        <ProjectName />
        {(() => {
          if (project.owner) {
            return (
              <p className="toolbar__project-owner">
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
        className="toolbar__theme-no-outline"
        onClick={() => {
          const newTheme = theme === 'light' ? 'dark' : 'light';
          handleThemeChange(newTheme);
        }}
        checked={theme === 'dark'}
      >
        <div className="toolbar__theme-svg">
          {theme === 'light' ? (
            <SunIcon className="toolbar__sun" />
          ) : (
            <MoonIcon />
          )}
        </div>
      </button>
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
