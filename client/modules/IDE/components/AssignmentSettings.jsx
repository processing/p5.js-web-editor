import React, { PropTypes } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ReactDOM from 'react-dom';
import { WithContext as ReactTags } from 'react-tag-input';
import InlineSVG from 'react-inlinesvg';
import classNames from 'classnames';
import { Link, browserHistory } from 'react-router';
import * as ClassroomActions from '../actions/classroom';

const leftArrow = require('../../../images/left-arrow.svg');
const exitUrl = require('../../../images/exit.svg');
const plusUrl = require('../../../images/plus.svg');
const minusUrl = require('../../../images/minus.svg');
const beepUrl = require('../../../sounds/audioAlert.mp3');
// import { debounce } from 'lodash';

class AssignmentSettingsForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentID: 0,
      suggestions: [],
      newName: '',
      newDescription: ''
    };

    this.closeAssignmentSettingsPage = this.closeAssignmentSettingsPage.bind(this);
    this.goBackToClassroom = this.goBackToClassroom.bind(this);

    this.handleUpdateAssignment = this.handleUpdateAssignment.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
  }

  componentWillUpdate(nextProps) {
    console.log(nextProps);
    this.state.newName = nextProps.assignment.name;
    this.state.newDescription = nextProps.assignment.description;
  }

  closeAssignmentSettingsPage() {
    // browserHistory.push(this.props.previousPath);
    browserHistory.push('/');
  }

  goBackToClassroom() {
    browserHistory.push(`/classroom/${this.props.classroom._id}`);
  }

  handleUpdateAssignment(e) {
    this.props.classroom.assignments.forEach((assignment) => {
      if (assignment._id === this.props.assignment._id) {
        assignment.name = this.state.newName;
        assignment.description = this.state.newDescription;
      }
    });

    this.props.updateClassroom();
  }

  handleNameChange(event) {
    this.setState({ newName: event.target.value });
  }

  handleDescriptionChange(event) {
    this.setState({ newDescription: event.target.value });
  }

  render() {
    const beep = new Audio(beepUrl);
    const { instructorNames, studentNames } = this.state;

    return (
      <section className="assignment-settings" aria-label="assignment settings" tabIndex="0" role="main" id="assignmentSettings">
        <header className="assignment-settings__header">
          <h2 className="assignment-settings__header-title">Assignment Settings</h2>
          <button
            className="assignment-settings__exit-button"
            onClick={this.goBackToClassroom}
            title="back"
            aria-label="back to classroom"
          >
            <InlineSVG src={leftArrow} alt="Back To Classroom" />
          </button>
          <button
            className="assignment-settings__exit-button"
            onClick={this.closeAssignmentSettingsPage}
            title="exit"
            aria-label="exit preferences"
          >
            <InlineSVG src={exitUrl} alt="Exit Classroom Settings" />
          </button>
        </header>
        <form className="assignment-settings__form">
          Name:
          <br />
          <input
            className="assignment-settings__form-element"
            type="text"
            value={this.state.newName}
            onChange={this.handleNameChange}
          />
          <br />
          Description:
          <br />
          <textarea
            className="assignment-settings__form-element assignment-settings__form-element-textarea"
            type="text"
            value={this.state.newDescription}
            onChange={this.handleDescriptionChange}
            cols="50"
            rows="4"
          >
          </textarea>
          <br />
          <input
            className="assignment-settings__form-element"
            type="button"
            value="Update"
            onClick={this.handleUpdateAssignment}
          />
        </form>
      </section>
    );
  }
}

AssignmentSettingsForm.propTypes = {
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
  assignment: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  }).isRequired
};

AssignmentSettingsForm.defaultProps = {};

function mapStateToProps(state) {
  return {
    assignment: state.assignment
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({}, ClassroomActions), dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(AssignmentSettingsForm);
