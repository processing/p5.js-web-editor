import PropTypes from 'prop-types';
import React from 'react';
import { reduxForm } from 'redux-form';
import classNames from 'classnames';
import InlineSVG from 'react-inlinesvg';
import NewFileForm from './NewFileForm';
import FileUploader from './FileUploader';

const exitUrl = require('../../../images/exit.svg');


// At some point this will probably be generalized to a generic modal
// in which you can insert different content
// but for now, let's just make this work
class NewFileModal extends React.Component {
  constructor(props) {
    super(props);
    this.focusOnModal = this.focusOnModal.bind(this);
  }

  componentDidMount() {
    this.focusOnModal();
  }

  focusOnModal() {
    this.modal.focus();
  }

  render() {
    const modalClass = classNames({
      'modal': true,
      'modal--reduced': !this.props.canUploadMedia
    });
    return (
      <section className={modalClass} tabIndex="0" ref={(element) => { this.modal = element; }}>
        <div className="modal-content">
          <div className="modal__header">
            <h2 className="modal__title">Add File</h2>
            <button className="modal__exit-button" onClick={this.props.closeModal}>
              <InlineSVG src={exitUrl} alt="Close New File Modal" />
            </button>
          </div>
          <NewFileForm
            focusOnModal={this.focusOnModal}
            {...this.props}
          />
          {(() => {
            if (this.props.canUploadMedia) {
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
}

NewFileModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  canUploadMedia: PropTypes.bool.isRequired
};

function validate(formProps) {
  const errors = {};

  if (!formProps.name) {
    errors.name = 'Please enter a name';
  } else if (!formProps.name.match(/(.+\.js$|.+\.css$|.+\.json$|.+\.txt$|.+\.csv$)/i)) {
    errors.name = 'File must be of type JavaScript, CSS, JSON, TXT, or CSV.';
  }

  return errors;
}


export default reduxForm({
  form: 'new-file',
  fields: ['name'],
  validate
})(NewFileModal);
