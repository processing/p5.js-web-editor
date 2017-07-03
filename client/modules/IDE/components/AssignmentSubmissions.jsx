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

class AssignmentSubmissions extends React.Component {
  constructor(props) {
    super(props);
    this.closeSubmissionList = this.closeSubmissionList.bind(this);
  }

  componentDidMount() {
    document.getElementById('submissionlist').focus();
  }

  closeSubmissionList() {
    // console.log(this.props.previousPath);
    browserHistory.push(this.props.previousPath);
  }

  submitAssignment() {
    console.log(this.props.classroom);
  }

  render() {
    return (
      <section className="sketch-list" aria-label="submissions list" tabIndex="0" role="main" id="submissionlist">
        <header className="sketch-list__header">
          <h2 className="sketch-list__header-title">Submissions for ASSIGNMENT_NAME_HERE in CLASSROOM_NAME_HERE</h2>
          <button className="sketch-list__exit-button" onClick={() => { this.submitAssignment(); }}>
            Submit Assignment
          </button>
          <button className="sketch-list__exit-button" onClick={this.closeSubmissionList}>
            <InlineSVG src={exitUrl} alt="Close Submissions List Overlay" />
          </button>
        </header>
        <div className="sketches-table-container">
          <table className="sketches-table" summary="table containing all submissions in this assignment">
            <thead>
              <tr>
                <th className="sketch-list__trash-column" scope="col"></th>
                <th scope="col">Submission Name</th>
                <th scope="col">Date created</th>
                <th scope="col">Date updated</th>
              </tr>
            </thead>
            <tbody>
              { /* {this.props.classroom.assignments.map(assignment =>
                // eslint-disable-next-line
                <tr
                  className="sketches-table__row visibility-toggle"
                  key={assignment._id}
                  onClick={() => browserHistory.push(`/assignment/${this.props.classroom._id}/${assignment._id}`)}
                >
                  <td className="sketch-list__trash-column"></td>
                  <th scope="row"><Link to={`/assignment/${assignment._id}`}>{assignment.name}</Link></th>
                  <td>{moment(assignment.createdAt).format('MMM D, YYYY h:mm A')}</td>
                </tr>
              )} */ }
            </tbody>
          </table>
        </div>
      </section>
    );
  }
}

AssignmentSubmissions.propTypes = {
  // getAssignments: PropTypes.func.isRequired,
  /* assignments: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired
  })).isRequired, */
  classroom: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    assignments: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired
    })).isRequired
  }).isRequired,
  previousPath: PropTypes.string.isRequired
};

AssignmentSubmissions.defaultProps = {
  classroom: {}
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

export default connect(mapStateToProps, mapDispatchToProps)(AssignmentSubmissions);
