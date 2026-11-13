import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Button, ButtonKinds } from '../../../common/Button';
import { Overlay } from '../../App/components/Overlay';
import { closeSaveAsCopyModal } from '../actions/ide';
import { cloneProject } from '../actions/project';

const SaveAsCopyModal = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const handleClose = () => dispatch(closeSaveAsCopyModal());
  const handleConfirm = () => {
    dispatch(closeSaveAsCopyModal());
    dispatch(cloneProject());
  };

  return (
    <Overlay
      title={t('Nav.File.SaveAsCopyTitle')}
      ariaLabel={t('Nav.File.SaveAsCopyTitle')}
      closeOverlay={handleClose}
    >
      <div className="save-as-copy-modal">
        <p>{t('Nav.File.SaveAsCopyConfirm')}</p>
        <div className="save-as-copy-modal__actions">
          <Button onClick={handleClose}>
            {t('Nav.File.SaveAsCopyCancel')}
          </Button>
          {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
          <Button
            kind={ButtonKinds.SECONDARY}
            onClick={handleConfirm}
            autoFocus
          >
            {t('Nav.File.SaveAsCopyButton')}
          </Button>
        </div>
      </div>
    </Overlay>
  );
};

export default SaveAsCopyModal;
