import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { reduxForm } from 'redux-form';
import NewFileForm from './NewFileForm';
import * as FileActions from '../actions/files';
import classNames from 'classnames';
import InlineSVG from 'react-inlinesvg';
const exitUrl = require('../../../images/exit.svg');

import FileUploader from './FileUploader';

// At some point this will probably be generalized to a generic modal
// in which you can insert different content
// but for now, let's just make this work
function NewFileModal(props) {
  const modalClass = classNames({
    modal: true,
    'modal--reduced': !props.canUploadMedia
  });
  return (
    <section className={modalClass}>
      <div className="modal-content">
        <div className="modal__header">
          <h2 className="modal__title">Add File</h2>
          <button className="modal__exit-button" onClick={props.closeModal}>
            <InlineSVG src={exitUrl} alt="Close New File Modal" />
          </button>
        </div>
        <NewFileForm {...props} />
        {(() => {
          if (props.canUploadMedia) {
            return (
              <div>
                <p className="modal__divider">OR</p>
                <FileUploader />
              </div>
            );
          }
          return '';
        })()}
      </div>
    </section>
  );
}

NewFileModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  canUploadMedia: PropTypes.bool.isRequired
};

function mapStateToProps() {
  return {};
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(FileActions, dispatch);
}

function validate(formProps) {
  const errors = {};

  if (!formProps.name) {
    errors.name = 'Please enter a name';
  } else if (!formProps.name.match(/(.+\.js$|.+\.css$)/)) {
    errors.name = 'File must be of type JavaScript or CSS.';
  }

  return errors;
}


export default reduxForm({
  form: 'new-file',
  fields: ['name'],
  validate
}, mapStateToProps, mapDispatchToProps)(NewFileModal);
