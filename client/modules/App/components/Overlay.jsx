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

  return (
    <div
      className={`overlay ${isFixedHeight ? 'overlay--is-fixed-height' : ''}`}
    >
      <div className="overlay__content">
        <section
          role="main"
          aria-label={ariaLabel}
          ref={ref}
          className="overlay__body"
        >
          <header className="overlay__header">
            <h2 className="overlay__title">{title}</h2>
            <div className="overlay__actions">
              <MediaQuery minWidth={770}>{actions}</MediaQuery>
              <button
                className="overlay__close-button"
                onClick={close}
                aria-label={t('Overlay.AriaLabel', { title })}
              >
                <ExitIcon focusable="false" aria-hidden="true" />
              </button>
            </div>
          </header>
          <MediaQuery maxWidth={769}>
            {actions && (
              <div className="overlay__actions-mobile">{actions}</div>
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
