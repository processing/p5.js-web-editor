import React from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Modal from './Modal';
import NewFileForm from './NewFileForm';
import { closeNewFileModal } from '../actions/ide';

const NewFileModal = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  return (
    <Modal
      title={t('NewFileModal.Title')}
      closeAriaLabel={t('NewFileModal.CloseButtonARIA')}
      onClose={() => dispatch(closeNewFileModal())}
    >
      <NewFileForm />
    </Modal>
  );
};

export default NewFileModal;
