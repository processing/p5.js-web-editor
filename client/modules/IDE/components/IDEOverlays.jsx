import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';
import Overlay from '../../App/components/Overlay';
import {
  closeKeyboardShortcutModal,
  closePreferences,
  closeShareModal,
  hideErrorModal
} from '../actions/ide';
import AddToCollectionList from './AddToCollectionList';
import ErrorModal from './ErrorModal';
import Feedback from './Feedback';
import KeyboardShortcutModal from './KeyboardShortcutModal';
import NewFileModal from './NewFileModal';
import NewFolderModal from './NewFolderModal';
import Preferences from './Preferences';
import { CollectionSearchbar } from './Searchbar';
import ShareModal from './ShareModal';
import UploadFileModal from './UploadFileModal';

export default function IDEOverlays() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const location = useLocation();
  const params = useParams();

  const {
    modalIsVisible,
    newFolderModalVisible,
    uploadFileModalVisible,
    preferencesIsVisible,
    keyboardShortcutVisible,
    shareModalVisible,
    errorType,
    previousPath
  } = useSelector((state) => state.ide);

  return (
    <>
      {preferencesIsVisible && (
        <Overlay
          title={t('Preferences.Settings')}
          ariaLabel={t('Preferences.Settings')}
          closeOverlay={() => dispatch(closePreferences())}
        >
          <Preferences />
        </Overlay>
      )}
      {location.pathname === '/feedback' && (
        <Overlay
          title={t('IDEView.SubmitFeedback')}
          previousPath={previousPath}
          ariaLabel={t('IDEView.SubmitFeedbackARIA')}
        >
          <Feedback />
        </Overlay>
      )}
      {location.pathname.match(/add-to-collection$/) && (
        <Overlay
          ariaLabel={t('IDEView.AddCollectionARIA')}
          title={t('IDEView.AddCollectionTitle')}
          previousPath={previousPath}
          actions={<CollectionSearchbar />}
          isFixedHeight
        >
          <AddToCollectionList projectId={params.project_id} />
        </Overlay>
      )}
      {shareModalVisible && (
        <Overlay
          title={t('IDEView.ShareTitle')}
          ariaLabel={t('IDEView.ShareARIA')}
          closeOverlay={() => dispatch(closeShareModal())}
        >
          <ShareModal />
        </Overlay>
      )}
      {keyboardShortcutVisible && (
        <Overlay
          title={t('KeyboardShortcuts.Title')}
          ariaLabel={t('KeyboardShortcuts.Title')}
          closeOverlay={() => dispatch(closeKeyboardShortcutModal())}
        >
          <KeyboardShortcutModal />
        </Overlay>
      )}
      {errorType && (
        <Overlay
          title={t('Common.Error')}
          ariaLabel={t('Common.ErrorARIA')}
          closeOverlay={() => dispatch(hideErrorModal())}
        >
          <ErrorModal
            type={errorType}
            closeModal={() => dispatch(hideErrorModal())}
          />
        </Overlay>
      )}
      {modalIsVisible && <NewFileModal />}
      {newFolderModalVisible && <NewFolderModal />}
      {uploadFileModalVisible && <UploadFileModal />}
    </>
  );
}
