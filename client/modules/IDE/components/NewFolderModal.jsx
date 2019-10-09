import PropTypes from 'prop-types';
import React from 'react';
import { reduxForm } from 'redux-form';
import InlineSVG from 'react-inlinesvg';
import NewFolderForm from './NewFolderForm';

const exitUrl = require('../../../images/exit.svg');

class NewFolderModal extends React.Component {
  componentDidMount() {
    this.newFolderModal.focus();
  }

  render() {
    return (
      <section className="modal" ref={(element) => { this.newFolderModal = element; }} >
        <div className="modal-content-folder">
          <div className="modal__header">
            <h2 className="modal__title">Add Folder</h2>
            <button className="modal__exit-button" onClick={this.props.closeModal}>
              <InlineSVG src={exitUrl} alt="Close New Folder Modal" />
            </button>
          </div>
          <NewFolderForm {...this.props} />
        </div>
      </section>
    );
  }
}

NewFolderModal.propTypes = {
  closeModal: PropTypes.func.isRequired
};

function validate(formProps) {
  const errors = {};
  if (!formProps.name) {
    errors.name = 'Please enter a name';
  } else if (formProps.name.trim().length === 0) {
    errors.name = 'Folder name cannot contain only spaces';
  } else if (formProps.name.match(/\.+/i)) {
    errors.name = 'Folder name cannot contain an extension';
  }

  return errors;
}
export default reduxForm({
  form: 'new-folder',
  fields: ['name'],
  validate
})(NewFolderModal);
