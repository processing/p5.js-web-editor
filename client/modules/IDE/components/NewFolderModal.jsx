import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { closeNewFolderModal } from '../actions/ide';
import Modal from './Modal';
import NewFolderForm from './NewFolderForm';

const NewFolderModal = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  return (
    <Modal
      title={t('NewFolderModal.Title')}
      closeAriaLabel={t('NewFolderModal.CloseButtonARIA')}
      onClose={() => dispatch(closeNewFolderModal())}
      contentClassName="modal-content-folder"
    >
      <NewFolderForm />
    </Modal>
  );
};

export default NewFolderModal;
