import PropTypes from 'prop-types';
import React, { useCallback, useRef } from 'react';
import MediaQuery from 'react-responsive';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useModalClose from '../../../common/useModalClose';

import ExitIcon from '../../../images/exit.svg';

const Overlay = ({
  actions,
  ariaLabel,
  children,
  closeOverlay,
  isFixedHeight,
  title
}) => {
  const { t } = useTranslation();

  const previousPath = useSelector((state) => state.ide.previousPath);

  // for better ui in rtl
  const direction = useSelector((state) => state.preferences.direction);

  const ref = useRef(null);

  const browserHistory = useHistory();

  const close = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    // Only close if it is the last (and therefore the topmost overlay)
    const overlays = document.getElementsByClassName('overlay');
    if (node.parentElement.parentElement !== overlays[overlays.length - 1])
      return;

    if (!closeOverlay) {
      browserHistory.push(previousPath);
    } else {
      closeOverlay();
    }
  }, [previousPath, closeOverlay, ref]);

  useModalClose(close, ref);

  // for better ui in rtl
  let classNames = {
    overlay__is_fixed_height: 'overlay--is-fixed-height',
    overlay__content: 'overlay__content',
    overlay__body: 'overlay__body',
    overlay__header: 'overlay__header',
    overlay__title: 'overlay__title',
    overlay__actions: 'overlay__actions',
    overlay__close_button: 'overlay__close-button',
    overlay__actions_mobile: 'overlay__actions-mobile'
  };
  if (direction === 'rtl') {
    classNames = {
      overlay__is_fixed_height: 'rtl-overlay--is-fixed-height',
      overlay__content: 'rtl-overlay__content',
      overlay__body: 'rtl-overlay__body',
      overlay__header: 'rtl-overlay__header',
      overlay__title: 'rtl-overlay__title',
      overlay__actions: 'rtl-overlay__actions',
      overlay__close_button: 'rtl-overlay__close-button',
      overlay__actions_mobile: 'rtl-overlay__actions-mobile'
    };
  }

  return (
    <div
      className={`overlay ${
        isFixedHeight ? classNames.overlay__is_fixed_height : ''
      }`}
    >
      <div className={classNames.overlay__content}>
        <section
          role="main"
          aria-label={classNames.ariaLabel}
          ref={ref}
          className={classNames.overlay__body}
        >
          <header className={classNames.overlay__header}>
            <h2 className={classNames.overlay__title}>{title}</h2>
            <div className={classNames.overlay__actions}>
              <MediaQuery minWidth={770}>{actions}</MediaQuery>
              <button
                className={classNames.overlay__close_button}
                onClick={close}
                aria-label={t('Overlay.AriaLabel', { title })}
              >
                <ExitIcon focusable="false" aria-hidden="true" />
              </button>
            </div>
          </header>
          <MediaQuery maxWidth={769}>
            {actions && (
              <div className={classNames.overlay__actions_mobile}>
                {actions}
              </div>
            )}
          </MediaQuery>
          {children}
        </section>
      </div>
    </div>
  );
};

Overlay.propTypes = {
  children: PropTypes.element,
  actions: PropTypes.element,
  closeOverlay: PropTypes.func,
  title: PropTypes.string,
  ariaLabel: PropTypes.string,
  isFixedHeight: PropTypes.bool
};

Overlay.defaultProps = {
  children: null,
  actions: null,
  title: 'Modal',
  closeOverlay: null,
  ariaLabel: 'modal',
  isFixedHeight: false
};

export default Overlay;
