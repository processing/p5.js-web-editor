import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { hideToast } from '../actions/toast';

import ExitIcon from '../../../images/exit.svg';

export default function Toast() {
  const { text, isVisible } = useSelector((state) => state.toast);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  if (!isVisible) {
    return null;
  }
  return (
    <section className="toast" role="status" aria-live="polite">
      <p>{t(text)}</p>
      <button
        className="toast__close"
        onClick={() => dispatch(hideToast())}
        aria-label="Close Alert"
      >
        <ExitIcon focusable="false" aria-hidden="true" />
      </button>
    </section>
  );
}
