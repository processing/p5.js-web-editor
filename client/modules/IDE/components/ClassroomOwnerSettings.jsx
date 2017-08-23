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
import ReactDOM from 'react-dom';
import { WithContext as ReactTags } from 'react-tag-input';
import InlineSVG from 'react-inlinesvg';
import classNames from 'classnames';

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
      tags: [{ id: 1, text: 'instructor1' }, { id: 2, text: 'instructor2' }],
      suggestions: []
    };
    this.handleDelete = this.handleDelete.bind(this);
    this.handleAddition = this.handleAddition.bind(this);
    this.handleDrag = this.handleDrag.bind(this);
  }

  handleDelete(i) {
    const tags = this.state.tags;
    tags.splice(i, 1);
    this.setState({ tags });
  }

  handleAddition(tag) {
    const tags = this.state.tags;
    tags.push({
      id: tags.length + 1,
      text: tag
    });
    this.setState({ tags });
  }

  handleDrag(tag, currPos, newPos) {
    const tags = this.state.tags;

    // mutate array
    tags.splice(currPos, 1);
    tags.splice(newPos, 0, tag);

    // re-render
    this.setState({ tags });
  }

  handleUpdateFont(event) {
    let value = parseInt(event.target.value, 10);
    if (isNaN(value)) {
      value = 16;
    }
    // this.props.setFontSize(value);
  }

  render() {
    const beep = new Audio(beepUrl);
    const { tags, suggestions } = this.state;

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
        <input
          type="text"
          onChange={e => console.log(e)}
          aria-label="TODO: LABEL"
          name="TODO: NAME"
          id="lint-warning-off"
          className="TODO:CLASSNAME"
          value={this.props.classroom.name}
        />
        <input
          type="text"
          onChange={e => console.log(e)}
          aria-label="TODO: LABEL"
          name="TODO: NAME"
          id="lint-warning-off"
          className="TODO:CLASSNAME"
          value={this.props.classroom.description}
        />
        <div>
          <ReactTags
            tags={tags}
            suggestions={suggestions}
            handleDelete={this.handleDelete}
            handleAddition={this.handleAddition}
            handleDrag={this.handleDrag}
          />
        </div>
        <input type="submit" disabled={false} value="Save" aria-label="updateClassroom" />
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
    })).isRequired
  }).isRequired,
};

export default ClassroomOwnerSettingsForm;
