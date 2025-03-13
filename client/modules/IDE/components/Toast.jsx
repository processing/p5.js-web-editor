import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { hideToast } from '../actions/toast';

import ExitIcon from '../../../images/exit.svg';

export default function Toast() {
  const { text, isVisible } = useSelector((state) => state.toast);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    if (isVisible) {
      const liveRegion = document.getElementById('toast-live-region');
      if (liveRegion) {
        liveRegion.textContent = t(text); // Update live region globally
      }
    }
  }, [isVisible, text, t]);

  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* Global ARIA Live Region */}
      <div
        id="toast-live-region"
        aria-live="assertive"
        style={{ position: 'absolute', left: '-9999px' }}
      />

      {/* Toast UI */}
      <section className="toast" role="status">
        <p>{t(text)}</p>
        <button
          className="toast__close"
          onClick={() => dispatch(hideToast())}
          aria-label="Close Alert"
        >
          <ExitIcon focusable="false" aria-hidden="true" />
        </button>
      </section>
    </>
  );
}
