import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { browserHistory } from 'react-router';
import * as ClassroomActions from '../actions/classroom';
import * as ProjectActions from '../actions/project';
import * as ToastActions from '../actions/toast';

class ClassroomList extends React.Component {
  constructor(props) {
    super(props);
    this.openClassroomActionsPopup = this.openClassroomActionsPopup.bind(this);
    this.closeClassroomActionsPopup = this.closeClassroomActionsPopup.bind(this);
    this.props.getClassrooms(this.props.username);
  }

  openClassroomActionsPopup(id) {
    const classroomElem = document.getElementById(id);
    const popupElem = classroomElem.getElementsByClassName('classroom-actions-popup')[0];
    popupElem.style.display = 'block';
  }

  closeClassroomActionsPopup(id) {
    const classroomElem = document.getElementById(id);
    const popupElem = classroomElem.getElementsByClassName('classroom-actions-popup')[0];
    popupElem.style.display = 'none';
  }

  render() {
    return (
      <div className="classroom-list">
        <div className="classrooms-grid-container">
          <div className="classrooms-grid" summary="grid containing all classes you own or are a member of">
            {this.props.classrooms.map(classroom =>
              // eslint-disable-next-line
              <div 
                key={classroom.id}
                id={classroom.id}
                className="classrooms-grid-tile"
              >
                <button
                  className="classroom-actions-ellipsis"
                  onClick={() => this.openClassroomActionsPopup(classroom.id)}
                >
                  <i className="material-icons md-22">more_horiz</i>
                </button>
                <div className="classroom-actions-popup">
                  <button
                    className="classroom-actions-popup-close"
                    onClick={() => this.closeClassroomActionsPopup(classroom.id)}
                  >
                    <i className="material-icons md-16">close</i>
                  </button>
                  <div className="classroom-actions-popup-label">Classroom actions</div>
                  <div className="classroom-actions-popup-hr"></div>
                  <button className="classroom-actions-popup-label">Rename</button>
                  <button className="classroom-actions-popup-label">Change thumbnail</button>
                  <button className="classroom-actions-popup-label">Download</button>
                  <button className="classroom-actions-popup-label">Duplicate</button>
                  <button className="classroom-actions-popup-label">Share</button>
                  <button className="classroom-actions-popup-label">Delete</button>
                </div>
                <div className="classrooms-grid-tile-thumbnail">
                  <div className="classrooms-grid-tile-thumbnail-buttons">
                    <button
                      className="classrooms-grid-tile-button-open"
                      onClick={() => browserHistory.replace(`/classrooms/${classroom.id}`)}
                    >
                    </button>
                    <button className="classrooms-grid-tile-button classrooms-grid-tile-button-share">
                      <i className="material-icons md-20">share</i>
                    </button>
                    <button
                      className="classrooms-grid-tile-button classrooms-grid-tile-button-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Are you sure you want to delete "${classroom.name}"?`)) {
                          this.props.deleteClassroom(classroom.id);
                        }
                      }}
                    >
                      <i className="material-icons md-20">delete</i>
                    </button>
                    <button className="classrooms-grid-tile-button classrooms-grid-tile-button-download">
                      <i className="material-icons md-20">file_download</i>
                    </button>
                  </div>
                </div>
                <div className="classrooms-grid-tile-title">{classroom.name}</div>
              </div>
            )}
          </div>
        </div>
        <button
          className="classroom-list__create-button"
          onClick={() => {
            this.props.createNewClassroom();
            this.props.getClassrooms(this.props.username);
          }}
        >
          Create new Classroom
        </button>
      </div>
    );
  }
}

ClassroomList.propTypes = {
  getClassrooms: PropTypes.func.isRequired,
  createNewClassroom: PropTypes.func.isRequired,
  classrooms: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired
  })).isRequired,
  username: PropTypes.string,
  deleteClassroom: PropTypes.func.isRequired,
};

ClassroomList.defaultProps = {
  username: undefined
};

function mapStateToProps(state) {
  return {
    user: state.user,
    classrooms: state.classrooms
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({}, ClassroomActions, ProjectActions, ToastActions), dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ClassroomList);
