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

  submitAssignment() {
    console.log('nyi');
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
          Fields go here
        </div>
      </section>
    );
  }
}

CreateClassroom.propTypes = {
  // getAssignments: PropTypes.func.isRequired,
  /* assignments: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired
  })).isRequired, */
  previousPath: PropTypes.string.isRequired
};

CreateClassroom.defaultProps = {
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

export default connect(mapStateToProps, mapDispatchToProps)(CreateClassroom);
