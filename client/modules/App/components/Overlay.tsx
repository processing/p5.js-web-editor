import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
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

  const modalRef = useRef<HTMLElement>(null);
  const [refNode, setRefNode] = useState<HTMLDivElement | null>(null);

  const browserHistory = useHistory();

  const isDesktop = useMediaQuery({ minWidth: 770 });
  const isMobile = useMediaQuery({ maxWidth: 769 });

  const close = useCallback(() => {
    const node = modalRef.current;
    if (!node) return;
    // Only close if it is the last (and therefore the topmost overlay)
    const overlays = document.getElementsByClassName('overlay__body');
    if (node !== overlays[overlays.length - 1]) return;

    if (!closeOverlay) {
      browserHistory.push(previousPath);
    } else {
      closeOverlay();
    }
  }, [previousPath, closeOverlay]);

  useModalClose(close, modalRef);

  const refCallback = useCallback((node: HTMLDivElement | null) => {
    setRefNode(node);
  }, []);

  useLayoutEffect(() => {
    if (!refNode) {
      return () => {};
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (!refNode.contains(document.activeElement)) return;

      const focusableSelectors = [
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        'a[href]',
        '[tabindex="0"]'
      ].join(', ');

      const header = refNode.querySelector('.overlay__header');
      const headerElements = Array.from(
        header?.querySelectorAll<HTMLElement>(focusableSelectors) ?? []
      );

      const activeTab = refNode.querySelector<HTMLElement>(
        '.react-tabs__tab--selected'
      );

      const activePanel = refNode.querySelector<HTMLElement>(
        '.react-tabs__tab-panel--selected'
      );
      const panelElements = Array.from(
        activePanel?.querySelectorAll<HTMLElement>(focusableSelectors) ?? []
      );

      const focusableElements = [
        ...headerElements,
        ...(activeTab ? [activeTab] : []),
        ...panelElements
      ];

      const currentIndex = focusableElements.indexOf(
        document.activeElement as HTMLElement
      );

      e.preventDefault();

      if (currentIndex === -1) {
        const firstPanelElement = panelElements[0] ?? focusableElements[0];
        firstPanelElement.focus();
        return;
      }

      if (e.shiftKey) {
        const prevIndex =
          currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
        focusableElements[prevIndex].focus();
      } else {
        const nextIndex =
          currentIndex >= focusableElements.length - 1 ? 0 : currentIndex + 1;
        focusableElements[nextIndex].focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [refNode]);

  return (
    <div
      className={`overlay ${isFixedHeight ? 'overlay--is-fixed-height' : ''}`}
      ref={refCallback}
    >
      <div className="overlay__content">
        <section
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          ref={modalRef}
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
