import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { browserHistory } from 'react-router';
import * as ClassroomActions from '../actions/classroom';
import * as ProjectActions from '../actions/project';
import * as ToastActions from '../actions/toast';

const humanizeList = require('humanize-list');

class ClassroomView extends React.Component {
  constructor(props) {
    super(props);

    this.createNewAssignment = this.createNewAssignment.bind(this);
    this.goToAssignmentSubmissionPage = this.goToAssignmentSubmissionPage.bind(this);
    this.goBackToClassroomList = this.goBackToClassroomList.bind(this);
    this.getInstructorUsernames = this.getInstructorUsernames.bind(this);
    this.openSketch = this.openSketch.bind(this);
    this.deleteAssignment = this.deleteAssignment.bind(this);
    this.goToAssignmentSettingsPage = this.goToAssignmentSettingsPage.bind(this);
    this.isUserAnInstructor = this.isUserAnInstructor.bind(this);
  }

  componentDidMount() {
    document.getElementById('assignmentlist').focus();
  }

  getInstructorUsernames() {
    const instructors = this.props.classroom.instructors;
    if (!instructors) return '';

    const instructorNames = [];
    instructors.forEach((instructor) => {
      instructorNames.push(instructor.username);
    });

    let instructorsString = 'Instructors: ';
    if (instructorNames.length === 1) {
      instructorsString = 'Instructor: ';
    }
    instructorsString += humanizeList(instructorNames);
    return instructorsString;
  }

  createNewAssignment() {
    const assignment = {
      name: 'New Assignment',
      submissions: []
    };
    this.props.classroom.assignments.push(assignment);
    this.props.saveClassroom();
    this.props.setAssignment(assignment);
  }

  goToAssignmentSubmissionPage(assignment) {
    this.props.setAssignment(assignment);
    browserHistory.replace(`/classrooms/${this.props.classroom.id}/assignments/${assignment.id}/submissions/new`);
  }

  goToAssignmentSettingsPage(assignment) {
    this.props.getClassroom(this.props.classroom.id);
    this.props.setAssignment(assignment);
    browserHistory.replace(`/classrooms/${this.props.classroom.id}/assignments/${assignment.id}/edit`);
  }

  goBackToClassroomList() {
    browserHistory.replace('/classrooms');
  }

  openClassroomSettings() {
    this.props.getClassroom(this.props.classroom.id);
    browserHistory.replace(`/classrooms/${this.props.classroom.id}/edit`);
  }

  openSketch(sketch) {
    browserHistory.push(`/${sketch.user}/sketches/${sketch.id}`);
  }

  isUserAnInstructor() {
    let isInstructor = false;
    if (!this.props.classroom.instructors) {
      return false;
    }
    this.props.classroom.instructors.forEach((instructor) => {
      if (instructor.username === this.props.user.username) {
        isInstructor = true;
      }
    });
    return isInstructor;
  }

  deleteAssignment(assignmentToDelete) {
    if (!window.confirm(`Are you sure you want to delete "${assignmentToDelete.name}"?`)) {
      return;
    }

    let deleteAssignmentIndex = null;
    this.props.classroom.assignments.forEach((assignment) => {
      if (assignment.id === assignmentToDelete.id) {
        deleteAssignmentIndex = this.props.classroom.assignments.indexOf(assignment);
      }
    });
    if (deleteAssignmentIndex !== null) {
      this.props.classroom.assignments.splice(deleteAssignmentIndex, 1);
    }
    this.props.saveClassroom();
  }

  render() {
    const isOwner = this.isUserAnInstructor();
    return (
      <section className="assignment-list" aria-label="classroom list" tabIndex="0" role="main" id="assignmentlist">
        <div className="assignment-list__classroom-info">
          <h3 className="assignment-list__instructors">{this.getInstructorUsernames()}</h3>
          <h3 className="assignment-list__description">{this.props.classroom.description}</h3>
          {isOwner ?
            <button className="assignment-list__exit-button" onClick={() => { this.openClassroomSettings(); }}>
              Classroom Settings
            </button>
          : null}
          {isOwner ?
            <button className="assignment-list__exit-button" onClick={() => { this.createNewAssignment(); }}>
              Create new Assignment
            </button>
          : null}
        </div>
        <div className="assignment-list__assignments-container">
          {this.props.classroom.assignments.map(assignment =>
            <div key={assignment.id} className="assignment-list__assignment-container">
              <h3 className="assignment-list__assignment-name">{assignment.name}</h3>
              <h3 className="assignment-list__assignment-description">{assignment.description}</h3>
              {isOwner ?
                <button
                  className="assignment-list__assignment-delete"
                  onClick={() => { this.deleteAssignment(assignment); }}
                >
                Delete Assignment
              </button>
              : null}
              {isOwner ?
                <button
                  className="assignment-list__assignment-settings"
                  onClick={() => { this.goToAssignmentSettingsPage(assignment); }}
                >
                  Assignment Settings
                </button>
              : null}
              <button
                className="assignment-list__assignment-submit"
                onClick={() => { this.goToAssignmentSubmissionPage(assignment); }}
              >
                Submit Sketch
              </button>
              <hr className="assignment-list__hr" />
              <div key={assignment.id} className="assignment-list__assignment-submissions">
                {assignment.submissions.map(sketch =>
                  <button
                    onClick={() => {
                      this.openSketch(sketch);
                    }}
                    key={sketch.id}
                    className="assignment-list__assignment-submission"
                  >
                    { /* Placeholder image */ }
                    <img
                      alt={sketch.name}
                      src="http://i.imgur.com/AjyQF5I.png"
                      className="assignment-list__assignment-submission-thumbnail"
                    />
                    <div className="assignment-list__assignment-submission-name">{sketch.name}</div>
                    <div className="assignment-list__assignment-submission-attribution">By {sketch.user}</div>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }
}

ClassroomView.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string
  }).isRequired,
  setAssignment: PropTypes.func.isRequired,
  saveClassroom: PropTypes.func.isRequired,
  getClassroom: PropTypes.func.isRequired,
  classroom: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    instructors: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })).isRequired,
    assignments: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
      submissions: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        id: PropTypes.string.isRequired,
        user: PropTypes.string.isRequired
      })).isRequired,
    })).isRequired,
  }).isRequired,
};

ClassroomView.defaultProps = {
  classroom: {},
  assignment: undefined
};

function mapStateToProps(state) {
  return {
    classroom: state.classroom,
    user: state.user,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({}, ClassroomActions, ProjectActions, ToastActions), dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ClassroomView);
