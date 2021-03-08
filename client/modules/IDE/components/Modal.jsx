import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { remSize, common, prop } from '../../../theme';
import { ExitIcon } from '../../../common/icons';

const ModalWrapper = styled.section`
  position: absolute;
  top: ${remSize(60)};
  right: 50%;
  transform: translate(50%, 0);
  z-index: 100;
  outline: none;
`;

const ModalContent = styled.div`
  background-color: ${prop('Modal.background')};
  border: 1px solid ${prop('Modal.border')};
  box-shadow: 0 12px 12px ${common.shadowColor};
  border-radius: 2px;
  z-index: 20;
  min-height: ${remSize(150)};
  width: ${remSize(500)};
  padding: ${remSize(20)};
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${remSize(20)};
`;

const ModalTitle = styled.h2``;

const Modalbutton = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
`;

const Modal = (props) => (
  <ModalWrapper ref={props.setRef}>
    <ModalContent>
      <ModalHeader>
        <ModalTitle>{props.title}</ModalTitle>
        <Modalbutton
          onClick={props.closeModal}
          aria-label={props.closeButtonAria}
        >
          <ExitIcon focusable="false" aria-hidden="true" />
        </Modalbutton>
      </ModalHeader>
      {props.children}
    </ModalContent>
  </ModalWrapper>
);

Modal.propTypes = {
  setRef: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  closeModal: PropTypes.func.isRequired,
  closeButtonAria: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
};

export default Modal;
