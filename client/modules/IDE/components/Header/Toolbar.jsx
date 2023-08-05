import React, { useRef } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  hideEditProjectName,
  showEditProjectName
} from '../../actions/project';
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
import { useSketchActions } from '../../hooks';

import PlayIcon from '../../../../images/play.svg';
import StopIcon from '../../../../images/stop.svg';
import PreferencesIcon from '../../../../images/preferences.svg';
import EditProjectNameIcon from '../../../../images/pencil.svg';

const Toolbar = (props) => {
  const { isPlaying, infiniteLoop, preferencesIsVisible } = useSelector(
    (state) => state.ide
  );
  const project = useSelector((state) => state.project);
  const { autorefresh } = useSelector((state) => state.preferences);
  const dispatch = useDispatch();

  const { t } = useTranslation();
  const { changeSketchName, canEditProjectName } = useSketchActions();

  const projectNameInputRef = useRef();

  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      dispatch(hideEditProjectName());
      projectNameInputRef.current.blur();
    }
  }

  function handleProjectNameClick() {
    if (canEditProjectName) {
      dispatch(showEditProjectName());
      setTimeout(() => {
        projectNameInputRef.current?.focus();
      }, 140);
    }
  }

  function handleProjectNameSave() {
    const newName = projectNameInputRef.current?.value;
    if (newName.length > 0) {
      dispatch(hideEditProjectName());
      changeSketchName(newName);
    }
  }

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
  const nameContainerClass = classNames({
    'toolbar__project-name-container': true,
    'toolbar__project-name-container--editing': project.isEditingName
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
          console.log('play button pressed');
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
      <div className={nameContainerClass}>
        <button
          className="toolbar__project-name"
          onClick={handleProjectNameClick}
          disabled={!canEditProjectName}
          aria-label={t('Toolbar.EditSketchARIA')}
        >
          <span>{project.name}</span>
          {canEditProjectName && (
            <EditProjectNameIcon
              className="toolbar__edit-name-button"
              focusable="false"
              aria-hidden="true"
            />
          )}
        </button>
        <input
          type="text"
          maxLength="128"
          className="toolbar__project-name-input"
          aria-label={t('Toolbar.NewSketchNameARIA')}
          ref={projectNameInputRef}
          onBlur={handleProjectNameSave}
          onFocus={(event) => (event.target.value = project.name)}
          onKeyPress={handleKeyPress}
        />
        {(() => {
          if (project.owner) {
            return (
              <p className="toolbar__project-project.owner">
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
