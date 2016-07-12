import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import moment from 'moment';
import { Link } from 'react-router';
import Nav from '../../../components/Nav';
import * as SketchActions from '../actions';
import * as ProjectActions from '../../IDE/actions/project';

class SketchListView extends React.Component {
  componentDidMount() {
    this.props.getProjects();
  }

  render() {
    return (
      <div className="sketch-list">
        <Nav
          user={this.props.user}
          createProject={this.props.createProject}
          saveProject={this.props.saveProject}
        />
        <table className="sketches-table">
          <thead>
            <th>Name</th>
            <th>Created</th>
            <th>Last Updated</th>
          </thead>
          <tbody>
            {this.props.sketches.map(sketch =>
              <tr className="sketches-table__row">
                <td><Link to={`/projects/${sketch._id}`}>{sketch.name}</Link></td>
                <td>{moment(sketch.createdAt).format('MMM D, YYYY')}</td>
                <td>{moment(sketch.updatedAt).format('MMM D, YYYY')}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }
}

SketchListView.propTypes = {
  user: PropTypes.object.isRequired,
  createProject: PropTypes.func.isRequired,
  saveProject: PropTypes.func.isRequired,
  getProjects: PropTypes.func.isRequired,
  sketches: PropTypes.array.isRequired
};

function mapStateToProps(state) {
  return {
    user: state.user,
    sketches: state.sketches
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({}, SketchActions, ProjectActions), dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SketchListView);
