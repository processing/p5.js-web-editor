import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { reduxForm } from 'redux-form';
import { withTranslation } from 'react-i18next';
import i18n from 'i18next';
import NewFileForm from './NewFileForm';
import { closeNewFileModal } from '../actions/ide';
import { createFile } from '../actions/files';
import { CREATE_FILE_REGEX } from '../../../../server/utils/fileUtils';

import ExitIcon from '../../../images/exit.svg';


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
    return (
      <section className="modal" ref={(element) => { this.modal = element; }}>
        <div className="modal-content">
          <div className="modal__header">
            <h2 className="modal__title">{this.props.t('NewFileModal.Title')}</h2>
            <button
              className="modal__exit-button"
              onClick={this.props.closeNewFileModal}
              aria-label={this.props.t('NewFileModal.CloseButtonARIA')}
            >
              <ExitIcon focusable="false" aria-hidden="true" />
            </button>
          </div>
          <NewFileForm
            focusOnModal={this.focusOnModal}
            {...this.props}
          />
        </div>
      </section>
    );
  }
}

NewFileModal.propTypes = {
  createFile: PropTypes.func.isRequired,
  closeNewFileModal: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired
};

function validate(formProps) {
  const errors = {};

  if (!formProps.name) {
    errors.name = i18n.t('NewFileModal.EnterName');
  } else if (!formProps.name.match(CREATE_FILE_REGEX)) {
    errors.name = i18n.t('NewFileModal.InvalidType');
  }

  return errors;
}

function mapStateToProps() {
  return {};
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createFile, closeNewFileModal }, dispatch);
}

export default withTranslation()(compose(
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    form: 'new-file',
    fields: ['name'],
    validate
  })
)(NewFileModal));
