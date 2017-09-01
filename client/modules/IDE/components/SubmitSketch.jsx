import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import moment from 'moment';
import { browserHistory } from 'react-router';
import * as SketchActions from '../actions/projects';
import * as ClassroomActions from '../actions/classroom';
import * as ProjectActions from '../actions/project';
import * as ToastActions from '../actions/toast';

class SubmitSketch extends React.Component {
  constructor(props) {
    super(props);
    this.closeSumbitSketchList = this.closeSumbitSketchList.bind(this);
    this.submitSketch = this.submitSketch.bind(this);

    this.props.getProjects(this.props.username);
  }

  submitSketch(sketch) {
    this.props.classroom.assignments.forEach((assignment) => {
      if (assignment.id === this.props.assignment.id) {
        assignment.submissions.push({
          id: sketch.id,
          name: sketch.name,
          user: this.props.user.username
        });
      }
    });
    browserHistory.replace(`/classrooms/${this.props.classroom.id}`);
    this.props.saveClassroom();
  }

  closeSumbitSketchList() {
    browserHistory.push(this.props.previousPath);
  }

  render() {
    return (
      <div className="sketches-table-container">
        { this.props.sketches.length === 0 &&
          <p className="sketches-table__empty">No sketches.</p>
        }
        { this.props.sketches.length > 0 &&
          <table className="sketches-table" summary="table containing all saved projects">
            <thead>
              <tr>
                <th scope="col">Sketch</th>
                <th scope="col">Date created</th>
                <th scope="col">Date updated</th>
              </tr>
            </thead>
            <tbody>
              {this.props.sketches.map(sketch =>
                // eslint-disable-next-line
                <tr 
                  className="sketches-table__row visibility-toggle"
                  key={sketch.id}
                  onClick={() => this.submitSketch(sketch)}
                >
                  <th scope="row">{sketch.name}</th>
                  <td>{moment(sketch.createdAt).format('MMM D, YYYY h:mm A')}</td>
                  <td>{moment(sketch.updatedAt).format('MMM D, YYYY h:mm A')}</td>
                </tr>
              )}
            </tbody>
          </table>}
      </div>
    );
  }
}

SubmitSketch.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string
  }).isRequired,
  classroom: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    assignments: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired
    })).isRequired
  }).isRequired,
  assignment: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired
  }).isRequired,
  getProjects: PropTypes.func.isRequired,
  sketches: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired
  })).isRequired,
  username: PropTypes.string,
  previousPath: PropTypes.string.isRequired,
  saveClassroom: PropTypes.func.isRequired
};

SubmitSketch.defaultProps = {
  classroom: {},
  username: undefined,
};

function mapStateToProps(state) {
  return {
    classroom: state.classroom,
    user: state.user,
    sketches: state.sketches,
    assignment: state.assignment
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({}, SketchActions, ClassroomActions, ProjectActions, ToastActions), dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SubmitSketch);
