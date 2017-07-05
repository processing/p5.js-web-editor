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

class CreateAssignment extends React.Component {
  constructor(props) {
    super(props);
    this.closeCreateAssignmentPage = this.closeCreateAssignmentPage.bind(this);
  }

  componentDidMount() {
    document.getElementById('createassignmentfields').focus();
  }

  closeCreateAssignmentPage() {
    // console.log(this.props.previousPath);
    browserHistory.push(this.props.previousPath);
  }

  render() {
    return (
      <section className="sketch-list" aria-label="submissions list" tabIndex="0" role="main" id="createassignmentfields">
        <header className="sketch-list__header">
          <h2 className="sketch-list__header-title">Create new assignment for CLASSROOM_NAME_HERE</h2>
          <button className="sketch-list__exit-button" onClick={this.closeCreateAssignmentPage}>
            <InlineSVG src={exitUrl} alt="Close Create Assignment Overlay" />
          </button>
        </header>
        <div className="sketches-table-container">
          Fields go here
        </div>
      </section>
    );
  }
}

CreateAssignment.propTypes = {
  // getAssignments: PropTypes.func.isRequired,
  /* assignments: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired
  })).isRequired, */
  previousPath: PropTypes.string.isRequired
};

CreateAssignment.defaultProps = {
  classroom: {}
};

function mapStateToProps(state) {
  return {
    // assignments: state.assignments
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({}, ClassroomActions, ProjectActions, ToastActions), dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateAssignment);
