import React, { PropTypes } from 'react';
import { reduxForm } from 'redux-form';
import InlineSVG from 'react-inlinesvg';
const exitUrl = require('../../../images/exit.svg');
import NewFolderForm from './NewFolderForm';

class NewFolderModal extends React.Component {
  componentDidMount() {
    this.refs.modal.focus();
  }

  render() {
    return (
      <section className="modal" ref="modal" tabIndex="0">
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

export default reduxForm({
  form: 'new-folder',
  fields: ['name']
})(NewFolderModal);

