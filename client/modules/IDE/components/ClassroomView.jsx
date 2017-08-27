import React, { PropTypes } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import moment from 'moment';
import { Link, browserHistory } from 'react-router';
import InlineSVG from 'react-inlinesvg';
import * as ClassroomActions from '../actions/classroom';
import * as ProjectActions from '../actions/project';
import * as ToastActions from '../actions/toast';

const leftArrow = require('../../../images/left-arrow.svg');
const exitUrl = require('../../../images/exit.svg');
const trashCan = require('../../../images/trash-can.svg');

const humanizeList = require('humanize-list');

class ClassroomView extends React.Component {
  constructor(props) {
    super(props);
    this.closeClassroomView = this.closeClassroomView.bind(this);
    this.createNewAssignment = this.createNewAssignment.bind(this);
    this.goToAssignmentSubmissionPage = this.goToAssignmentSubmissionPage.bind(this);
    this.goBackToClassroomList = this.goBackToClassroomList.bind(this);
    this.getInstructorUsernames = this.getInstructorUsernames.bind(this);
    this.openSketch = this.openSketch.bind(this);
    this.deleteAssignment = this.deleteAssignment.bind(this);
    this.goToAssignmentSettingsPage = this.goToAssignmentSettingsPage.bind(this);
    // this.props.getAssignments(this.props.classroomid);
  }

  componentDidMount() {
    document.getElementById('assignmentlist').focus();
  }

  getInstructorUsernames() {
    const instructors = this.props.classroom.owners;
    if (!instructors) return '';

    const instructorNames = [];
    instructors.forEach((instructor) => {
      instructorNames.push(instructor.name);
    });

    let instructorsString = 'Instructors: ';
    if (instructorNames.length === 1) {
      instructorsString = 'Instructor: ';
    }
    instructorsString += humanizeList(instructorNames);
    return instructorsString;
  }

  closeClassroomView() {
    // browserHistory.push(this.props.previousPath);
    browserHistory.push('/');
  }

  createNewAssignment() {
    /* const assignment = {
      name: 'New Assignment',
      submissions: []
    };
    this.props.classroom.assignments.push(assignment);
    this.props.saveClassroom(); */

    // browserHistory.push('/createassignment');

    const assignment = {
      name: 'New Assignment',
      submissions: []
    };
    this.props.classroom.assignments.push(assignment);
    this.props.saveClassroom();
    this.props.setAssignment(assignment);
    // browserHistory.push(`/assignment/${this.props.classroom._id}/${assignment._id}`);
  }

  goToAssignmentSubmissionPage(assignment) {
    // this.props.assignment = assignment;
    this.props.setAssignment(assignment);
    browserHistory.push('/submitsketch');
    // browserHistory.push(`/assignment/${this.props.classroom._id}/${assignment._id}`);
  }

  goToAssignmentSettingsPage(assignment) {
    this.props.setAssignment(assignment);
    browserHistory.push('/assignmentsettings');
  }

  goBackToClassroomList() {
    browserHistory.push('/myclassrooms');
  }

  openClassroomSettings() {
    this.props.getClassroom(this.props.classroom._id);
    browserHistory.push(`/classroomsettings/${this.props.classroom._id}`);
  }

  openSketch(sketch) {
    browserHistory.push(`/username/sketches/${sketch.id}`);
  }

  deleteAssignment(assignmentToDelete) {
    if (!window.confirm(`Are you sure you want to delete "${assignmentToDelete.name}"?`)) {
      return;
    }

    let deleteAssignmentIndex = null;
    this.props.classroom.assignments.forEach((assignment) => {
      if (assignment._id === assignmentToDelete._id) {
        deleteAssignmentIndex = this.props.classroom.assignments.indexOf(assignment);
      }
    });
    if (deleteAssignmentIndex !== null) {
      this.props.classroom.assignments.splice(deleteAssignmentIndex, 1);
    }
    this.props.saveClassroom();
  }

  render() {
    return (
      <section className="assignment-list" aria-label="classroom list" tabIndex="0" role="main" id="assignmentlist">
        <header className="assignment-list__header">
          <h2 className="assignment-list__header-title">{this.props.classroom.name}</h2>
          <button className="assignment-list__exit-button" onClick={() => { this.openClassroomSettings(); }}>
            Classroom Settings
          </button>
          <button className="assignment-list__exit-button" onClick={this.goBackToClassroomList}>
            <InlineSVG src={leftArrow} alt="Go Back To Classroom List" />
          </button>
          <button className="assignment-list__exit-button" onClick={this.closeClassroomView}>
            <InlineSVG src={exitUrl} alt="Close Assignments List Overlay" />
          </button>
        </header>
        <div className="assignment-list__classroom-info">
          <h3 className="assignment-list__instructors">{this.getInstructorUsernames()}</h3>
          <h3 className="assignment-list__description">{this.props.classroom.description}</h3>
        </div>
        <div className="assignment-list__assignments-container">
          {this.props.classroom.assignments.map(assignment =>
            <div key={assignment._id} className="assignment-list__assignment-container">
              <h3 className="assignment-list__assignment-name">{assignment.name}</h3>
              <h3 className="assignment-list__assignment-description">{assignment.description}</h3>
              <button
                className="assignment-list__assignment-delete"
                onClick={() => { this.deleteAssignment(assignment); }}
              >
                Delete Assignment
              </button>
              <button
                className="assignment-list__assignment-submit"
                onClick={() => { this.goToAssignmentSubmissionPage(assignment); }}
              >
                Submit Sketch
              </button>
              <button
                className="assignment-list__assignment-settings"
                onClick={() => { this.goToAssignmentSettingsPage(assignment); }}
              >
                Assignment Settings
              </button>
              <hr className="assignment-list__hr" />
              <div key={assignment._id} className="assignment-list__assignment-submissions">
                {assignment.submissions.map(sketch =>
                  <button onClick={() => { this.openSketch(sketch); }} key={sketch._id} className="assignment-list__assignment-submission">
                    <img alt={sketch.name} src="http://www.allneopets.com/images/1.gif" className="assignment-list__assignment-submission-thumbnail" />
                    <div className="assignment-list__assignment-submission-name">{sketch.name}</div>
                    <div className="assignment-list__assignment-submission-attribution">By {sketch.user}</div>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        <button className="assignment-list__exit-button" onClick={() => { this.createNewAssignment(); }}>
          Create new Assignment
        </button>
      </section>
    );
  }
}

ClassroomView.propTypes = {
  // getAssignments: PropTypes.func.isRequired,
  /* assignments: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired
  })).isRequired, */
  /* assignment: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired
  }), */
  setAssignment: PropTypes.func.isRequired,
  saveClassroom: PropTypes.func.isRequired,
  getClassroom: PropTypes.func.isRequired,
  classroom: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    owners: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })).isRequired,
    assignments: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.string.isRequired,
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
    // assignments: state.assignments
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({}, ClassroomActions, ProjectActions, ToastActions), dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ClassroomView);
