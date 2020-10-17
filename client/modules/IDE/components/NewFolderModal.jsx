import PropTypes from 'prop-types';
import React from 'react';
import { reduxForm } from 'redux-form';
import { withTranslation } from 'react-i18next';
import i18n from 'i18next';
import NewFolderForm from './NewFolderForm';

import ExitIcon from '../../../images/exit.svg';

class NewFolderModal extends React.Component {
  constructor(props) {
    super(props);
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
  }

  componentDidMount() {
    this.newFolderModal.focus();
    document.addEventListener('click', this.handleOutsideClick, false);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleOutsideClick, false);
  }

  handleOutsideClick(e) {
    // ignore clicks on the component itself
    if (e.path.includes(this.newFolderModal)) return;

    this.props.closeModal();
  }

  render() {
    return (
      <section className="modal" ref={(element) => { this.newFolderModal = element; }} >
        <div className="modal-content-folder">
          <div className="modal__header">
            <h2 className="modal__title">{this.props.t('NewFolderModal.Title')}</h2>
            <button
              className="modal__exit-button"
              onClick={this.props.closeModal}
              aria-label={this.props.t('NewFolderModal.CloseButtonARIA')}
            >
              <ExitIcon focusable="false" aria-hidden="true" />
            </button>
          </div>
          <NewFolderForm {...this.props} />
        </div>
      </section>
    );
  }
}

NewFolderModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired
};

function validate(formProps) {
  const errors = {};
  if (!formProps.name) {
    errors.name = i18n.t('NewFolderModal.EnterName');
  } else if (formProps.name.trim().length === 0) {
    errors.name = i18n.t('NewFolderModal.EmptyName');
  } else if (formProps.name.match(/\.+/i)) {
    errors.name = i18n.t('NewFolderModal.InvalidExtension');
  }

  return errors;
}
export default withTranslation()(reduxForm({
  form: 'new-folder',
  fields: ['name'],
  validate
})(NewFolderModal));
