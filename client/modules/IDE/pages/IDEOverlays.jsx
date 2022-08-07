import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { withRouter } from 'react-router';
import Overlay from '../../App/components/Overlay';
import {
  closeKeyboardShortcutModal,
  closePreferences,
  closeShareModal,
  hideErrorModal
} from '../actions/ide';
import About from '../components/About';
import AddToCollectionList from '../components/AddToCollectionList';
import ErrorModal from '../components/ErrorModal';
import Feedback from '../components/Feedback';
import KeyboardShortcutModal from '../components/KeyboardShortcutModal';
import NewFileModal from '../components/NewFileModal';
import NewFolderModal from '../components/NewFolderModal';
import Preferences from '../components/Preferences';
import { CollectionSearchbar } from '../components/Searchbar';
import ShareModal from '../components/ShareModal';
import UploadFileModal from '../components/UploadFileModal';

function IDEOverlays({ location, params }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const {
    modalIsVisible,
    newFolderModalVisible,
    uploadFileModalVisible,
    preferencesIsVisible,
    shareModalVisible,
    keyboardShortcutVisible,
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
      {location.pathname === '/about' && (
        <Overlay
          title={t('About.Title')}
          previousPath={previousPath}
          ariaLabel={t('About.Title')}
        >
          <About />
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
          <AddToCollectionList
            projectId={params.project_id}
            username={params.username}
          />
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

// TODO: use `useLocation` hook after updating react-router

IDEOverlays.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string
  }).isRequired,
  params: PropTypes.shape({
    project_id: PropTypes.string,
    username: PropTypes.string,
    reset_password_token: PropTypes.string
  }).isRequired
};

export default withRouter(IDEOverlays);
