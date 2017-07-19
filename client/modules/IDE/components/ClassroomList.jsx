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

class ClassroomList extends React.Component {
  constructor(props) {
    super(props);
    this.closeClassroomList = this.closeClassroomList.bind(this);
    this.createNewClassroom = this.createNewClassroom.bind(this);
    this.props.getClassrooms(this.props.username);
  }

  componentDidMount() {
    document.getElementById('classroomlist').focus();
  }

  createNewClassroom() {
    this.props.createNewClassroom();
    browserHistory.push('createclassroom');
  }

  closeClassroomList() {
    // browserHistory.push(this.props.previousPath);
    browserHistory.push('/');
  }

  render() {
    const username = this.props.username !== undefined ? this.props.username : this.props.user.username;
    return (
      <section className="classroom-list" aria-label="classroom list" tabIndex="0" role="main" id="classroomlist">
        <header className="classroom-list__header">
          <h2 className="classroom-list__header-title">Open a Classroom</h2>
          <button className="classroom-list__exit-button" onClick={() => { this.createNewClassroom(); }}>
            Create new Classroom
          </button>
          <button className="classroom-list__exit-button" onClick={this.closeClassroomList}>
            <InlineSVG src={exitUrl} alt="Close Classroom List Overlay" />
          </button>
        </header>
        <div className="classrooms-grid-container">
          <div className="classrooms-grid" summary="grid containing all classes you own or are a member of">
            {this.props.classrooms.map(classroom =>
              // eslint-disable-next-line
              <div 
                key={classroom._id}
                className="classrooms-grid-tile"
              >
                <button
                  className="classrooms-grid-tile-thumbnail"
                  onClick={() => browserHistory.push(`/classroom/${classroom._id}`)}
                >
                  <div className="classrooms-grid-tile-thumbnail-buttons">
                    <button className="classrooms-grid-tile-button classrooms-grid-tile-button-share"></button>
                    <button className="classrooms-grid-tile-button classrooms-grid-tile-button-delete"></button>
                    <button className="classrooms-grid-tile-button classrooms-grid-tile-button-download"></button>
                  </div>
                </button>
                <div className="classrooms-grid-tile-title">{classroom.name}</div>
                {(() => { // eslint-disable-line
                  if (this.props.username === this.props.user.username || this.props.username === undefined) {
                    return (
                      <button
                        className="classroom-list__trash-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Are you sure you want to delete "${classroom.name}"?`)) {
                            this.props.deleteClassroom(classroom._id);
                          }
                        }}
                      >
                        <InlineSVG src={trashCan} alt="Delete Classroom" />
                      </button>
                    );
                  }
                })()}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }
}

ClassroomList.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string
  }).isRequired,
  getClassrooms: PropTypes.func.isRequired,
  createNewClassroom: PropTypes.func.isRequired,
  classrooms: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired
  })).isRequired,
  username: PropTypes.string,
  deleteClassroom: PropTypes.func.isRequired,
  // previousPath: PropTypes.string.isRequired,
};

ClassroomList.defaultProps = {
  username: undefined
};

function mapStateToProps(state) {
  return {
    user: state.user,
    classrooms: state.classrooms /* [{ id: '', name: 'Test Classroom', createdAt: '', updatedAt: '' }] */ /* state.classrooms */
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({}, ClassroomActions, ProjectActions, ToastActions), dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ClassroomList);
