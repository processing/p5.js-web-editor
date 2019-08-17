import PropTypes from 'prop-types';
import React from 'react';
import { reduxForm } from 'redux-form';
import classNames from 'classnames';
import InlineSVG from 'react-inlinesvg';

const exitUrl = require('../../../images/exit.svg');

// At some point this will probably be generalized to a generic modal
// in which you can insert different content
// but for now, let's just make this work
class AddLibraryModal extends React.Component {
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
      modal: true,
    });

    return (
      <section className={modalClass} ref={(element) => { this.modal = element; }}>
        <div className="modal-content">
          <div className="modal__header">
            <h2 className="modal__title">Add Library</h2>
            <button className="modal__exit-button" onClick={this.props.closeModal}>
              <InlineSVG src={exitUrl} alt="Close New File Modal" />
            </button>
          </div>
        </div>
      </section>
    );
  }
}

AddLibraryModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  // addLibraryRequest: PropTypes.func.isRequired,
};

export default reduxForm({
  form: 'add-library',
  fields: ['name'],
})(AddLibraryModal);
