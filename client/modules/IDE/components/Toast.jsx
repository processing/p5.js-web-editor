import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { hideToast } from '../actions/toast';

import ExitIcon from '../../../images/exit.svg';

export default function Toast() {
  const { text, isVisible } = useSelector((state) => state.toast);
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  if (!isVisible) {
    return null;
  }
  // `text` may be either a translation key (e.g. 'Toast.SketchSaved') or a raw
  // message coming from the server (e.g. an auth error containing a URL).
  // Only translate when it's a known key — otherwise i18next would mangle
  // strings with ':' or '.' by treating them as namespace/key separators.
  const message = i18n.exists(text) ? t(text) : text;
  return (
    <section className="toast" role="status" aria-live="polite">
      <p>{message}</p>
      <button
        className="toast__close"
        onClick={() => dispatch(hideToast())}
        aria-label={t('Toast.CloseAlertARIA')}
      >
        <ExitIcon focusable="false" aria-hidden="true" />
      </button>
    </section>
  );
}
