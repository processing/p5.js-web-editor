import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import NewFolderForm from './NewFolderForm';
import Modal from './Modal';

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
      <Modal
        setRef={(element) => (this.newFolderModal = element)}
        title={this.props.t('NewFolderModal.Title')}
        closeModal={this.props.closeModal}
        closeButtonAria={this.props.t('NewFolderModal.CloseButtonARIA')}
      >
        <NewFolderForm />
      </Modal>
    );
  }
}

NewFolderModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired
};

export default withTranslation()(NewFolderModal);
