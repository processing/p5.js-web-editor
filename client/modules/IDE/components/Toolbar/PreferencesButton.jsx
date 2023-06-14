import classNames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import PreferencesIcon from '../../../../images/preferences.svg';
import { openPreferences } from '../../actions/ide';

export default function PreferencesButton() {
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
