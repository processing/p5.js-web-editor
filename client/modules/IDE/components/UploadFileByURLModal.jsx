import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { withTranslation } from 'react-i18next';
import prettyBytes from 'pretty-bytes';
import { reduxForm } from 'redux-form';
import { bindActionCreators, compose } from 'redux';

import getConfig from '../../../utils/getConfig';
import { getreachedTotalSizeLimit } from '../selectors/users';
import ExitIcon from '../../../images/exit.svg';

import UploadFileByURLForm from './UploadFileByURLForm';
import { closeUploadFileByURLModal } from '../actions/ide';
import { createFile, uploadFileByURL } from '../actions/files';
import { EXTERNAL_LINK_REGEX, fileExtensionsArray } from '../../../../server/utils/fileUtils';


const limit = getConfig('UPLOAD_LIMIT') || 250000000;
const limitText = prettyBytes(limit);

class UploadFileByURLModal extends React.Component {
  propTypes = {
    createFile: PropTypes.func.isRequired,
    reachedTotalSizeLimit: PropTypes.bool.isRequired,
    closeModal: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired
  }

  componentDidMount() {
    this.focusOnModal();
  }

  focusOnModal = () => {
    this.modal.focus();
  }

  render() {
    return (
      <section className="modal" ref={(element) => { this.modal = element; }}>
        <div className="modal-content">
          <div className="modal__header">
            <h2 className="modal__title">{this.props.t('UploadFileByURLModal.Title')}</h2>
            <button
              className="modal__exit-button"
              onClick={this.props.closeModal}
              aria-label={this.props.t('UploadFileByURLModal.CloseButtonARIA')}
            >
              <ExitIcon focusable="false" aria-hidden="true" />
            </button>
          </div>
          { this.props.reachedTotalSizeLimit &&
            <p>
              {this.props.t('UploadFileByURLModal.SizeLimitError', { sizeLimit: limitText })}
              <Link to="/assets" onClick={this.props.closeModal}>assets</Link>
              .
            </p>
          }
          { !this.props.reachedTotalSizeLimit &&
            <UploadFileByURLForm
              focusOnModal={this.focusOnModal}
              {...this.props}
            />
          }
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

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createFile, uploadFileByURL }, dispatch);
}

function validate(formProps) {
  const errors = {};

  if (!formProps.url) {
    errors.url = 'please enter a url !';
  } else if (!formProps.url.match(EXTERNAL_LINK_REGEX)) {
    errors.url = 'please enter a valid url !';
  } else {
    const fileUrl = formProps.url.split('/');
    const fileName = fileUrl[fileUrl.length - 1].split('.');
    const extn = fileName[fileName.length - 1];

    if (!fileExtensionsArray.includes(extn)) {
      errors.url = 'invalid file type';
    }
  }

  return errors;
}

export default withTranslation()(compose(
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    form: 'upload-file-by-url',
    fields: ['url'],
    validate
  })
)(UploadFileByURLModal));
