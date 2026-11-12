import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { hideToast } from '../actions/toast';

import ExitIcon from '../../../images/exit.svg';

export default function Toast() {
  const { text, isVisible } = useSelector((state) => state.toast);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  return (
    <>
      {/* The live region stays in the page, so screen readers that only watch
          existing live regions announce the message when it is added. */}
      <div className="visually-hidden" role="status" aria-live="polite">
        {isVisible ? t(text) : ''}
      </div>
      {isVisible && (
        <section className="toast">
          {/* Announced through the live region above */}
          <p aria-hidden="true">{t(text)}</p>
          <button
            className="toast__close"
            onClick={() => dispatch(hideToast())}
            aria-label={t('Toast.CloseAlertARIA')}
          >
            <ExitIcon focusable="false" aria-hidden="true" />
          </button>
        </section>
      )}
    </>
  );
}
