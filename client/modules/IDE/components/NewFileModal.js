import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { reduxForm } from 'redux-form';
import NewFileForm from './NewFileForm';
import * as FileActions from '../actions/files';
import classNames from 'classnames';
import InlineSVG from 'react-inlinesvg';
const exitUrl = require('../../../images/exit.svg');

// At some point this will probably be generalized to a generic modal
// in which you can insert different content
// but for now, let's just make this work
function NewFileModal(props) {
  const modalClass = classNames({
    modal: true,
    'modal--hidden': !props.isVisible
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
      </div>
    </section>
  );
}

NewFileModal.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired
};

function mapStateToProps(state) {
  return {
    file: state.files
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(FileActions, dispatch);
}

function validate(formProps) {
  const errors = {};

  if (!formProps.name) {
    errors.name = 'Please enter a name';
  }

  // if (formProps.name.match(/(.+\.js$|.+\.css$)/)) {
  //   errors.name = 'File must be of type JavaScript or CSS.';
  // }

  return errors;
}


export default reduxForm({
  form: 'new-file',
  fields: ['name'],
  validate
}, mapStateToProps, mapDispatchToProps)(NewFileModal);
