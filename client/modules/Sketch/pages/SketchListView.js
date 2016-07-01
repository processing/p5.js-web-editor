import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
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
        <ul className="sketch-list__items">
        {this.props.sketches.map(sketch =>
          <li>{sketch.name}</li>
        )}
        </ul>
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
