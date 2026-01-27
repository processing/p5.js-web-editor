import React, { useCallback, useRef } from 'react';
import { useMediaQuery } from 'react-responsive';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useModalClose } from '../../../common/useModalClose';
import type { RootState } from '../../../reducers';

import ExitIcon from '../../../images/exit.svg';

type OverlayProps = {
  children?: React.ReactNode;
  actions?: React.ReactNode;
  closeOverlay?: () => void;
  title?: string;
  ariaLabel?: string;
  isFixedHeight?: boolean;
};

export const Overlay = ({
  actions,
  ariaLabel = 'modal',
  children,
  closeOverlay,
  isFixedHeight = false,
  title = 'Modal'
}: OverlayProps) => {
  const { t } = useTranslation();

  const previousPath = useSelector(
    (state: RootState) => state.ide.previousPath
  );

  const ref = useRef<HTMLElement>(null);

  const browserHistory = useHistory();

  const isDesktop = useMediaQuery({ minWidth: 770 });
  const isMobile = useMediaQuery({ maxWidth: 769 });

  const close = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    // Only close if it is the last (and therefore the topmost overlay)
    const overlays = document.getElementsByClassName('overlay');
    if (node.parentElement?.parentElement !== overlays[overlays.length - 1])
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
              {isDesktop && actions}
              <button
                className="overlay__close-button"
                onClick={close}
                aria-label={t('Overlay.AriaLabel', { title })}
              >
                <ExitIcon focusable="false" aria-hidden="true" />
              </button>
            </div>
          </header>
          {isMobile && actions && (
            <div className="overlay__actions-mobile">{actions}</div>
          )}
          {children}
        </section>
      </div>
    </div>
  );
};
