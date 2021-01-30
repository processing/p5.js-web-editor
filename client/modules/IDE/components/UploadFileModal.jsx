import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { withTranslation } from 'react-i18next';
import prettyBytes from 'pretty-bytes';
import getConfig from '../../../utils/getConfig';
import FileUploader from './FileUploader';
import { getreachedTotalSizeLimit } from '../selectors/users';
import ExitIcon from '../../../images/exit.svg';

const limit = getConfig('UPLOAD_LIMIT') || 250000000;
const limitText = prettyBytes(limit);

class UploadFileModal extends React.Component {
  propTypes = {
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
      <section
        className="modal"
        ref={(element) => {
          this.modal = element;
        }}
      >
        <div className="modal-content">
          <div className="modal__header">
            <h2 className="modal__title">
              {this.props.t('UploadFileModal.Title')}
            </h2>
            <button
              className="modal__exit-button"
              onClick={this.props.closeModal}
              aria-label={this.props.t('UploadFileModal.CloseButtonARIA')}
            >
              <ExitIcon focusable="false" aria-hidden="true" />
            </button>
          </div>
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
        </div>
      </section>
    );
  }
}

function mapStateToProps(state) {
  return {
    reachedTotalSizeLimit: getreachedTotalSizeLimit(state)
  };
}

export default withTranslation()(connect(mapStateToProps)(UploadFileModal));
