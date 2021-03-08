import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { withTranslation } from 'react-i18next';
import prettyBytes from 'pretty-bytes';
import getConfig from '../../../utils/getConfig';
import FileUploader from './FileUploader';
import { getreachedTotalSizeLimit } from '../selectors/users';
import Modal from './Modal';

const limit = getConfig('UPLOAD_LIMIT') || 250000000;
const limitText = prettyBytes(limit);

class UploadFileModal extends React.Component {
  static propTypes = {
    reachedTotalSizeLimit: PropTypes.bool.isRequired,
    closeModal: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired
  };

  componentDidMount() {
    this.focusOnModal();
  }

  focusOnModal = () => {
    this.modal.focus();
  };

  render() {
    return (
      <Modal
        setRef={(element) => (this.modal = element)}
        title={this.props.t('UploadFileModal.Title')}
        closeModal={this.props.closeModal}
        closeButtonAria={this.props.t('UploadFileModal.CloseButtonARIA')}
      >
        {this.props.reachedTotalSizeLimit && (
          <p>
            {this.props.t('UploadFileModal.SizeLimitError', {
              sizeLimit: limitText
            })}
            <Link to="/assets" onClick={this.props.closeModal}>
              assets
            </Link>
            .
          </p>
        )}
        {!this.props.reachedTotalSizeLimit && (
          <div>
            <FileUploader />
          </div>
        )}
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  return {
    reachedTotalSizeLimit: getreachedTotalSizeLimit(state)
  };
}

export default withTranslation()(connect(mapStateToProps)(UploadFileModal));
