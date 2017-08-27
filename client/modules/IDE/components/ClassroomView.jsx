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

    return humanizeList(instructorNames);
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

  goBackToClassroomList() {
    browserHistory.push('/myclassrooms');
  }

  openClassroomSettings() {
    this.props.getClassroom(this.props.classroom._id);
    browserHistory.push(`/ownerclassroomsettings/${this.props.classroom._id}`);
  }

  render() {
    console.log(this.props.classroom);
    return (
      <section className="assignment-list" aria-label="classroom list" tabIndex="0" role="main" id="assignmentlist">
        <header className="assignment-list__header">
          <h2 className="assignment-list__header-title">{this.props.classroom.name}</h2>
          <h2 className="assignment-list__header-title">{this.getInstructorUsernames()}</h2>
          <h2 className="assignment-list__header-title">{this.props.classroom.description}</h2>
          <button className="assignment-list__exit-button" onClick={() => { this.createNewAssignment(); }}>
            Create new Assignment
          </button>
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
        <div className="assignments-container">
          {this.props.classroom.assignments.map(assignment =>
            <div key={assignment._id} className="assignment-container">
              <div className="assignment-name">{assignment.name}</div>
              <div className="assignment-description">{assignment.description}</div>
              <button
                className="assignment-submit-link"
                onClick={() => { this.goToAssignmentSubmissionPage(assignment); }}
              >
                Submit Sketch
              </button>
              <div key={assignment._id} className="assignment-submissions">
                {assignment.submissions.map(sketch =>
                  <div key={sketch._id} className="assignment-submission">
                    <Link to={`/username/sketches/${sketch.id}`}>{sketch.name}</Link>
                    <div>By {sketch.user}</div>
                  </div>
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
