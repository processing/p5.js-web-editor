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
    browserHistory.push('createclassroom');
  }

  closeClassroomList() {
    browserHistory.push(this.props.previousPath);
  }

  render() {
    const username = this.props.username !== undefined ? this.props.username : this.props.user.username;
    return (
      <section className="sketch-list" aria-label="classroom list" tabIndex="0" role="main" id="classroomlist">
        <header className="sketch-list__header">
          <h2 className="sketch-list__header-title">Open a Classroom</h2>
          <button className="sketch-list__exit-button" onClick={() => { this.createNewClassroom(); }}>
            Create new Classroom
          </button>
          <button className="sketch-list__exit-button" onClick={this.closeClassroomList}>
            <InlineSVG src={exitUrl} alt="Close Classroom List Overlay" />
          </button>
        </header>
        <div className="sketches-table-container">
          <table className="sketches-table" summary="table containing all classes you own or are a member of">
            <thead>
              <tr>
                <th className="sketch-list__trash-column" scope="col"></th>
                <th scope="col">Classroom Name</th>
                <th scope="col">Date created</th>
                <th scope="col">Date updated</th>
              </tr>
            </thead>
            <tbody>
              {this.props.classrooms.map(classroom =>
                // eslint-disable-next-line
                <tr 
                  className="sketches-table__row visibility-toggle"
                  key={classroom._id}
                  onClick={() => browserHistory.push(`/classroom/${classroom._id}`)}
                >
                  <td className="sketch-list__trash-column">
                  {(() => { // eslint-disable-line
                    if (this.props.username === this.props.user.username || this.props.username === undefined) {
                      return (
                        <button
                          className="sketch-list__trash-button"
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
                  </td>
                  <th scope="row"><Link to={`/classroom/${classroom._id}`}>{classroom.name}</Link></th>
                  <td>{moment(classroom.createdAt).format('MMM D, YYYY h:mm A')}</td>
                  <td>{moment(classroom.updatedAt).format('MMM D, YYYY h:mm A')}</td>
                </tr>
              )}
            </tbody>
          </table>
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
  // createNewClassroom: PropTypes.func.isRequired,
  classrooms: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired
  })).isRequired,
  username: PropTypes.string,
  deleteClassroom: PropTypes.func.isRequired,
  previousPath: PropTypes.string.isRequired,
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
