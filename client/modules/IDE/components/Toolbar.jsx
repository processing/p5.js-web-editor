import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router';

import PlayIcon from '../../../images/play.svg';
import PreferencesIcon from '../../../images/preferences.svg';
import StopIcon from '../../../images/stop.svg';
import {
  openPreferences,
  startAccessibleSketch,
  startSketch,
  stopSketch
} from '../actions/ide';
import {
  setAutorefresh,
  setGridOutput,
  setTextOutput
} from '../actions/preferences';
import { saveProject, setProjectName } from '../actions/project';
import {
  selectProjectId,
  selectProjectName,
  selectProjectOwner
} from '../selectors/project';
import { selectCanEditSketch } from '../selectors/users';
import EditableInput from './EditableInput';

export function PlayButton({ syncFileContent }) {
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

export function StopButton() {
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

export function AutoRefreshCheckbox() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const autorefresh = useSelector((state) => state.preferences.autorefresh);

  return (
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
  );
}

export function EditableProjectName() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const projectId = useSelector(selectProjectId);
  const projectName = useSelector(selectProjectName);
  const canEditProjectName = useSelector(selectCanEditSketch);

  const handleProjectNameSave = (value) => {
    const newProjectName = value.trim();
    dispatch(setProjectName(newProjectName));
    if (projectId) {
      dispatch(saveProject());
    }
  };

  return (
    <EditableInput
      value={projectName}
      disabled={!canEditProjectName}
      aria-label={t('Toolbar.EditSketchARIA')}
      inputProps={{
        maxLength: 128,
        'aria-label': t('Toolbar.NewSketchNameARIA')
      }}
      validate={(text) => text.trim().length > 0}
      onChange={handleProjectNameSave}
    />
  );
}

export function ProjectOwner() {
  const { t } = useTranslation();

  const owner = useSelector(selectProjectOwner);

  if (!owner) return null;

  return (
    <p className="toolbar__project-owner">
      {t('Toolbar.By')}{' '}
      <Link to={`/${owner.username}/sketches`}>{owner.username}</Link>
    </p>
  );
}

export function PreferencesButton() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const preferencesIsVisible = useSelector(
    (state) => state.ide.preferencesIsVisible
  );

  return (
    <button
      className={classNames(
        'toolbar__preferences-button',
        preferencesIsVisible && 'toolbar__preferences-button--selected'
      )}
      onClick={() => dispatch(openPreferences())}
      aria-label={t('Toolbar.OpenPreferencesARIA')}
    >
      <PreferencesIcon focusable="false" aria-hidden="true" />
    </button>
  );
}

function Toolbar({ syncFileContent }) {
  return (
    <div className="toolbar">
      <PlayButton syncFileContent={syncFileContent} />
      <StopButton />
      <AutoRefreshCheckbox />
      <div className="toolbar__project-name-container">
        <EditableProjectName />
        <ProjectOwner />
      </div>
      <PreferencesButton />
    </div>
  );
}

Toolbar.propTypes = {
  syncFileContent: PropTypes.func.isRequired
};

export default Toolbar;
