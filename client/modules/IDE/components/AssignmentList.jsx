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

const exitUrl = require('../../../images/exit.svg');
const trashCan = require('../../../images/trash-can.svg');

class AssignmentList extends React.Component {
  constructor(props) {
    super(props);
    this.closeAssignmentList = this.closeAssignmentList.bind(this);
    this.createNewAssignment = this.createNewAssignment.bind(this);
    this.openAssignment = this.openAssignment.bind(this);
    // this.props.getAssignments(this.props.classroomid);
  }

  componentDidMount() {
    document.getElementById('assignmentlist').focus();
  }

  closeAssignmentList() {
    // console.log(this.props.previousPath);
    browserHistory.push(this.props.previousPath);
  }

  createNewAssignment() {
    browserHistory.push('/createassignment');
    // move this to create assignment page
    this.props.classroom.assignments.push({
      name: 'New Assignment',
      submissions: []
    });
    console.log(this.props.classroom);
    this.props.saveClassroom();
  }

  openAssignment(assignment) {
    // this.props.assignment = assignment;
    this.props.setAssignment(assignment);
    browserHistory.push(`/assignment/${this.props.classroom._id}/${assignment._id}`);
  }

  render() {
    return (
      <section className="sketch-list" aria-label="classroom list" tabIndex="0" role="main" id="assignmentlist">
        <header className="sketch-list__header">
          <h2 className="sketch-list__header-title">Assignments in CLASSROOM_NAME_HERE</h2>
          <button className="sketch-list__exit-button" onClick={() => { this.createNewAssignment(this.props.classroom._id); }}>
            Create new Assignment
          </button>
          <button className="sketch-list__exit-button" onClick={this.closeAssignmentList}>
            <InlineSVG src={exitUrl} alt="Close Assignments List Overlay" />
          </button>
        </header>
        <div className="sketches-table-container">
          <table className="sketches-table" summary="table containing all assignments in this classroom">
            <thead>
              <tr>
                <th className="sketch-list__trash-column" scope="col"></th>
                <th scope="col">Assignment Name</th>
                <th scope="col">Date created</th>
                <th scope="col">Date updated</th>
              </tr>
            </thead>
            <tbody>
              {this.props.classroom.assignments.map(assignment =>
                // eslint-disable-next-line
                <tr
                  className="sketches-table__row visibility-toggle"
                  key={assignment._id}
                  onClick={() => this.openAssignment(assignment)}
                >
                  <td className="sketch-list__trash-column"></td>
                  <th scope="row"><Link to={`/assignment/${assignment._id}`}>{assignment.name}</Link></th>
                  <td>{moment(assignment.createdAt).format('MMM D, YYYY h:mm A')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    );
  }
}

AssignmentList.propTypes = {
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
  classroom: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    assignments: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired
    })).isRequired
  }).isRequired,
  previousPath: PropTypes.string.isRequired,
  saveClassroom: PropTypes.func.isRequired
};

AssignmentList.defaultProps = {
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

export default connect(mapStateToProps, mapDispatchToProps)(AssignmentList);
