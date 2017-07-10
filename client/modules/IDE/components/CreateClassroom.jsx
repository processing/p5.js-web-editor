import React, { PropTypes } from 'react';
import axios from 'axios';
import { reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import moment from 'moment';
import { Link, browserHistory } from 'react-router';
import InlineSVG from 'react-inlinesvg';
import * as ClassroomActions from '../actions/classroom';
import * as ProjectActions from '../actions/project';
import * as ToastActions from '../actions/toast';
import { domOnlyProps } from '../../../utils/reduxFormUtils';

const exitUrl = require('../../../images/exit.svg');
const trashCan = require('../../../images/trash-can.svg');

function CreateClassroomForm(props) {
  const {
    fields: { name },
    handleSubmit,
    submitting,
    invalid,
    pristine
  } = props;
  return (
    <form className="form" onSubmit={handleSubmit(props.updateClassroom)}>
      <p className="form__field">
        <label htmlFor="name" className="form__label">Name</label>
        <input
          className="form__input"
          aria-label="name"
          type="text"
          id="name"
          {...domOnlyProps(name)}
        />
      </p>
      <input type="submit" disabled={submitting || invalid || pristine} value="Save" aria-label="updateClassroom" />
    </form>
  );
}

CreateClassroomForm.propTypes = {
  fields: PropTypes.shape({
    name: PropTypes.object.isRequired,
  }).isRequired,
  handleSubmit: PropTypes.func.isRequired,
  updateClassroom: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  invalid: PropTypes.bool,
  pristine: PropTypes.bool,
};

CreateClassroomForm.defaultProps = {
  submitting: false,
  pristine: true,
  invalid: false
};

class CreateClassroom extends React.Component {
  constructor(props) {
    super(props);
    this.closeCreateClassroomPage = this.closeCreateClassroomPage.bind(this);
  }

  componentDidMount() {
    document.getElementById('createclassroomfields').focus();
  }

  closeCreateClassroomPage() {
    // console.log(this.props.previousPath);
    browserHistory.push(this.props.previousPath);
  }

  render() {
    return (
      <section className="sketch-list" aria-label="submissions list" tabIndex="0" role="main" id="createclassroomfields">
        <header className="sketch-list__header">
          <h2 className="sketch-list__header-title">Create new classroom</h2>
          <button className="sketch-list__exit-button" onClick={this.closeCreateClassroomPage}>
            <InlineSVG src={exitUrl} alt="Close Create Classroom Overlay" />
          </button>
        </header>
        <div className="sketches-table-container">
          <CreateClassroomForm {...this.props} />
        </div>
      </section>
    );
  }
}

CreateClassroom.propTypes = {
  previousPath: PropTypes.string.isRequired,
};

CreateClassroom.defaultProps = {
  classroom: {},
};

function mapStateToProps(state) {
  return {
    // assignments: state.assignments
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({}, ClassroomActions, ProjectActions, ToastActions), dispatch);
}

export default reduxForm({
  form: 'updateAllSettings',
  fields: ['name'],
  /* validate: validateSettings,
  asyncValidate,
  asyncBlurFields: ['username', 'email', 'currentPassword'] */
}, mapStateToProps, mapDispatchToProps)(CreateClassroom);
