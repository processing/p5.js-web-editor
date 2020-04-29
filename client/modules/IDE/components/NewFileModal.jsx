import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { reduxForm } from 'redux-form';
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
            <h2 className="modal__title">Create File</h2>
            <button className="modal__exit-button" onClick={this.props.closeNewFileModal}>
              <ExitIcon title="Close New File Modal" />
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
  closeNewFileModal: PropTypes.func.isRequired
};

function validate(formProps) {
  const errors = {};

  if (!formProps.name) {
    errors.name = 'Please enter a name';
  } else if (!formProps.name.match(CREATE_FILE_REGEX)) {
    errors.name = 'Invalid file type. Valid extensions are .js, .css, .json, .txt, .csv, .tsv, .frag, and .vert.';
  }

  return errors;
}

function mapStateToProps() {
  return {};
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createFile, closeNewFileModal }, dispatch);
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    form: 'new-file',
    fields: ['name'],
    validate
  })
)(NewFileModal);
