import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import useModalClose from '../../../common/useModalClose';
import ExitIcon from '../../../images/exit.svg';

// Common logic from NewFolderModal, NewFileModal, UploadFileModal

const Modal = ({
  title,
  onClose,
  closeAriaLabel,
  contentClassName,
  children
}) => {
  const modalRef = useModalClose(onClose);

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

Modal.propTypes = {
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  closeAriaLabel: PropTypes.string.isRequired,
  contentClassName: PropTypes.string,
  children: PropTypes.node.isRequired
};

Modal.defaultProps = {
  contentClassName: ''
};

export default Modal;
