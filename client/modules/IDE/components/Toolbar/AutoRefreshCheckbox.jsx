import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { setAutorefresh } from '../../actions/preferences';

export default function AutoRefreshCheckbox() {
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
