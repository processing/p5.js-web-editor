/* import React, { PropTypes } from 'react';
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

const leftArrow = require('../../../images/left-arrow.svg');
const exitUrl = require('../../../images/exit.svg');
const trashCan = require('../../../images/trash-can.svg');

function ClassroomOwnerSettingsForm(props) {
  const {
    fields: { name, description },
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
      <p className="form__field">
        <label htmlFor="description" className="form__label">Description</label>
        <input
          className="form__input"
          aria-label="description"
          type="text"
          id="description"
          {...domOnlyProps(description)}
        />
      </p>
      <input type="submit" disabled={submitting || invalid || pristine} value="Save" aria-label="updateClassroom" />
    </form>
  );
}

ClassroomOwnerSettingsForm.propTypes = {
  fields: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired
  }).isRequired,
  handleSubmit: PropTypes.func.isRequired,
  updateClassroom: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  invalid: PropTypes.bool,
  pristine: PropTypes.bool,
};

ClassroomOwnerSettingsForm.defaultProps = {
  submitting: false,
  pristine: true,
  invalid: false
};

class ClassroomOwnerSettings extends React.Component {
  constructor(props) {
    super(props);
    this.closeClassroomSettingsPage = this.closeClassroomSettingsPage.bind(this);
    this.goBackToClassroom = this.goBackToClassroom.bind(this);
  }

  componentDidMount() {
    document.getElementById('createclassroomfields').focus();
  }

  closeClassroomSettingsPage() {
    // browserHistory.push(this.props.previousPath);
    browserHistory.push('/');
  }

  goBackToClassroom() {
    browserHistory.push(`/classroom/${this.props.classroom._id}`);
  }

  render() {
    return (
      <section className="sketch-list" aria-label="submissions list" tabIndex="0" role="main" id="createclassroomfields">
        <header className="sketch-list__header">
          <h2 className="sketch-list__header-title">Classroom Settings</h2>
          <button className="sketch-list__exit-button" onClick={this.goBackToClassroom}>
            <InlineSVG src={leftArrow} alt="Go Back To Classroom" />
          </button>
          <button className="sketch-list__exit-button" onClick={this.closeClassroomSettingsPage}>
            <InlineSVG src={exitUrl} alt="Close Create Classroom Overlay" />
          </button>
        </header>
        <div className="sketches-table-container">
          <ClassroomOwnerSettingsForm {...this.props} />
        </div>
      </section>
    );
  }
}

ClassroomOwnerSettings.propTypes = {
  // previousPath: PropTypes.string.isRequired,
  classroom: {},
};

ClassroomOwnerSettings.defaultProps = {
  classroom: {},
};

function mapStateToProps(state) {
  return {
    classroom: state.classroom,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({}, ClassroomActions, ProjectActions, ToastActions), dispatch);
}

export default reduxForm({
  form: 'updateAllSettings',
  fields: ['name', 'description'],
  // validate: validateSettings,
  // asyncValidate,
  // asyncBlurFields: ['username', 'email', 'currentPassword']
}, mapStateToProps, mapDispatchToProps)(ClassroomOwnerSettings);*/


// //////////////////////////////////////////////////////////////


import React, { PropTypes } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ReactDOM from 'react-dom';
import { WithContext as ReactTags } from 'react-tag-input';
import InlineSVG from 'react-inlinesvg';
import classNames from 'classnames';
import * as ClassroomActions from '../actions/classroom';

const leftArrow = require('../../../images/left-arrow.svg');
const exitUrl = require('../../../images/exit.svg');
const plusUrl = require('../../../images/plus.svg');
const minusUrl = require('../../../images/minus.svg');
const beepUrl = require('../../../sounds/audioAlert.mp3');
// import { debounce } from 'lodash';

class ClassroomOwnerSettingsForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentID: 0,
      instructorNames: [],
      studentNames: [],
      suggestions: [],
      newName: '',
      newDescription: ''
    };

    this.handleUpdateClassroom = this.handleUpdateClassroom.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
    this.handleInstructorDelete = this.handleInstructorDelete.bind(this);
    this.handleInstructorAddition = this.handleInstructorAddition.bind(this);
    this.handleStudentDelete = this.handleStudentDelete.bind(this);
    this.handleStudentAddition = this.handleStudentAddition.bind(this);
  }

  componentWillUpdate(nextProps) {
    if (!nextProps.classroom.owners) return;

    this.state.newName = nextProps.classroom.name;
    this.state.newDescription = nextProps.classroom.description;

    this.state.instructorNames = [];
    nextProps.classroom.owners.forEach((owner) => {
      this.state.instructorNames.push({
        id: this.state.instructorNames.length + 1,
        text: owner.name
      });
    });

    this.state.studentNames = [];
    nextProps.classroom.members.forEach((member) => {
      this.state.studentNames.push({
        id: this.state.studentNames.length + 1,
        text: member.name
      });
    });
  }

  handleUpdateClassroom(e) {
    this.props.classroom.name = this.state.newName;
    this.props.classroom.description = this.state.newDescription;

    this.props.classroom.owners = [];
    this.state.instructorNames.forEach((instructorName) => {
      this.props.classroom.owners.push({
        name: instructorName.text
      });
    });

    this.props.classroom.members = [];
    this.state.studentNames.forEach((studentName) => {
      this.props.classroom.members.push({
        name: studentName.text
      });
    });

    this.props.updateClassroom();
  }

  handleNameChange(event) {
    this.setState({ newName: event.target.value });
  }

  handleDescriptionChange(event) {
    this.setState({ newDescription: event.target.value });
  }

  handleInstructorDelete(i) {
    const instructorNames = this.state.instructorNames;
    instructorNames.splice(i, 1);
    this.setState({ instructorNames });
  }

  handleInstructorAddition(tag) {
    const instructorNames = this.state.instructorNames;
    instructorNames.push({
      id: instructorNames.length + 1,
      text: tag
    });
    this.setState({ instructorNames });
  }

  handleStudentDelete(i) {
    const studentNames = this.state.studentNames;
    studentNames.splice(i, 1);
    this.setState({ studentNames });
  }

  handleStudentAddition(tag) {
    const studentNames = this.state.studentNames;
    studentNames.push({
      id: studentNames.length + 1,
      text: tag
    });
    this.setState({ studentNames });
  }

  render() {
    const beep = new Audio(beepUrl);
    const { instructorNames, studentNames } = this.state;

    return (
      <section className="sketch-list" aria-label="submissions list" tabIndex="0" role="main" id="submissionlist">
        <div className="preferences__heading">
          <h2 className="preferences__title">Classroom Settings</h2>
          <button
            className="preferences__exit-button"
            onClick={console.log}
            title="exit"
            aria-label="exit preferences"
          >
            <InlineSVG src={exitUrl} alt="Exit Classroom Settings" />
          </button>
          <button
            className="preferences__exit-button"
            onClick={console.log}
            title="back"
            aria-label="back to classroom"
          >
            <InlineSVG src={leftArrow} alt="Back To Classroom" />
          </button>
        </div>
        <form>
          Name:
          <input
            type="text"
            value={this.state.newName}
            onChange={this.handleNameChange}
          />
          Description:
          <input
            type="text"
            value={this.state.newDescription}
            onChange={this.handleDescriptionChange}
          />
          <div>
            Instructors:
            <ReactTags
              tags={instructorNames}
              handleDelete={this.handleInstructorDelete}
              handleAddition={this.handleInstructorAddition}
              placeholder={'Add instructor'}
            />
          </div>
          <div>
            Students:
            <ReactTags
              tags={studentNames}
              handleDelete={this.handleStudentDelete}
              handleAddition={this.handleStudentAddition}
              placeholder={'Add student'}
            />
          </div>
          <input type="button" value="Update" onClick={this.handleUpdateClassroom} />
        </form>
      </section>
    );
  }
}

ClassroomOwnerSettingsForm.propTypes = {
  classroom: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string.isRequired,
    assignments: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired
    })).isRequired,
    owners: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })).isRequired,
    members: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })).isRequired
  }).isRequired,
  updateClassroom: PropTypes.func.isRequired,
};

ClassroomOwnerSettingsForm.defaultProps = {};

function mapStateToProps(state) {
  return {};
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({}, ClassroomActions), dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ClassroomOwnerSettingsForm);
