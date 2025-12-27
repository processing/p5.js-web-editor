import classNames from 'classnames';
import React, { ReactNode } from 'react';
import { useModalClose } from '../../../common/useModalClose';
import ExitIcon from '../../../images/exit.svg';

interface ModalProps {
  title: string;
  onClose: () => void;
  closeAriaLabel: string;
  contentClassName?: string;
  children: ReactNode;
}

// Common logic from NewFolderModal, NewFileModal, UploadFileModal
export const Modal = ({
  title,
  onClose,
  closeAriaLabel,
  contentClassName = '',
  children
}: ModalProps) => {
  const modalRef = useModalClose<HTMLElement>(onClose);

  return (
    <section className="modal" ref={modalRef}>
      <div className={classNames('modal-content', contentClassName)}>
        <div className="modal__header">
          <h2 className="modal__title">{title}</h2>
          <button
            className="modal__exit-button"
            onClick={onClose}
            aria-label={closeAriaLabel}
          >
            <ExitIcon focusable="false" aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </section>
  );
};
