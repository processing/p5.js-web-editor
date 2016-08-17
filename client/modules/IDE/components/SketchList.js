import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import moment from 'moment';
import { Link } from 'react-router';
import * as SketchActions from '../actions/projects';
import * as ProjectActions from '../actions/project';
import InlineSVG from 'react-inlinesvg';
const exitUrl = require('../../../images/exit.svg');

class SketchList extends React.Component {
  componentDidMount() {
    this.props.getProjects(this.props.username);
  }

  render() {
    return (
      <div className="sketch-list">
        <header className="sketch-list__header">
          <h2>Sketches</h2>
          <button className="sketch-list__exit-button" onClick={this.props.closeSketchList}>
            <InlineSVG src={exitUrl} alt="Close Sketch List Overlay" />
          </button>
        </header>
        <div className="sketches-table-container">
          <table className="sketches-table" summary="table containing all saved projects">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Created</th>
                <th scope="col">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {this.props.sketches.map(sketch =>
                <tr className="sketches-table__row" key={sketch.id}>
                  <td scope="row"><Link to={`/projects/${sketch._id}`}>{sketch.name}</Link></td>
                  <td>{moment(sketch.createdAt).format('MMM D, YYYY h:mm:ss A')}</td>
                  <td>{moment(sketch.updatedAt).format('MMM D, YYYY h:mm:ss A')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

SketchList.propTypes = {
  user: PropTypes.object.isRequired,
  getProjects: PropTypes.func.isRequired,
  sketches: PropTypes.array.isRequired,
  closeSketchList: PropTypes.func.isRequired,
  username: PropTypes.string
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

export default connect(mapStateToProps, mapDispatchToProps)(SketchList);
