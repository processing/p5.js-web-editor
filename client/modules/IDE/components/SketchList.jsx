import format from 'date-fns/format';
import PropTypes from 'prop-types';
import React from 'react';
import { Helmet } from 'react-helmet';
import InlineSVG from 'react-inlinesvg';
import { connect } from 'react-redux';
import { browserHistory, Link } from 'react-router';
import { bindActionCreators } from 'redux';
import * as ProjectActions from '../actions/project';
import * as SketchActions from '../actions/projects';
import * as ToastActions from '../actions/toast';

const trashCan = require('../../../images/trash-can.svg');
const arrowDown = require('../../../images/arrow5_down.svg');
const arrowUp = require('../../../images/arrow5_up.svg');

class SketchList extends React.Component {
  constructor(props) {
    super(props);
    this.props.getProjects(this.props.username);
    this.state = {
      orderTypeCREATEDAT: 'ASCENDING',
      orderTypeUPDATEDAT: 'ASCENDING',
    };
  }

  getSketchesTitle() {
    if (this.props.username === this.props.user.username) {
      return 'p5.js Web Editor | My sketches';
    }
    return `p5.js Web Editor | ${this.props.username}'s sketches`;
  }

  handleSort = (orderType, orderBy) => {
    this.props.sort(orderType, orderBy);
    const newValue = this.state[`orderType${orderBy}`] === 'ASCENDING' ? 'DESCENDING' : 'ASCENDING';
    this.setState(current => ({
      ...current,
      [`orderType${orderBy}`]: newValue
    }));
  }

  render() {
    const username = this.props.username !== undefined ? this.props.username : this.props.user.username;
    return (
      <div className="sketches-table-container">
        <Helmet>
          <title>{this.getSketchesTitle()}</title>
        </Helmet>
        { this.props.sketches.length === 0 &&
          <p className="sketches-table__empty">No sketches.</p>
        }
        { this.props.sketches.length > 0 &&
          <table className="sketches-table" summary="table containing all saved projects">
            <thead>
              <tr>
                <th className="sketch-list__trash-column" scope="col"></th>
                <th scope="col">Sketch</th>
                <th scope="col">Date created <button onClick={() => this.handleSort(this.state.orderTypeCREATEDAT, 'CREATEDAT')}><InlineSVG src={this.state.orderTypeCREATEDAT === 'ASCENDING' ? arrowUp : arrowDown} /></button></th>
                <th scope="col">Date updated <button onClick={() => this.handleSort(this.state.orderTypeUPDATEDAT, 'UPDATEDAT')}><InlineSVG src={this.state.orderTypeUPDATEDAT === 'ASCENDING' ? arrowUp : arrowDown} /></button></th>
              </tr>
            </thead>
            <tbody>
              {this.props.sketches.map(sketch =>
                // eslint-disable-next-line
                <tr
                  className="sketches-table__row visibility-toggle"
                  key={sketch.id}
                  onClick={() => browserHistory.push(`/${username}/sketches/${sketch.id}`)}
                >
                  <td className="sketch-list__trash-column">
                  {(() => { // eslint-disable-line
                      if (this.props.username === this.props.user.username || this.props.username === undefined) {
                        return (
                          <button
                            className="sketch-list__trash-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Are you sure you want to delete "${sketch.name}"?`)) {
                                this.props.deleteProject(sketch.id);
                              }
                            }}
                          >
                            <InlineSVG src={trashCan} alt="Delete Project" />
                          </button>
                        );
                      }
                    })()}
                  </td>
                  <th scope="row"><Link to={`/${username}/sketches/${sketch.id}`}>{sketch.name}</Link></th>
                  <td>{format(new Date(sketch.createdAt), 'MMM D, YYYY h:mm A')}</td>
                  <td>{format(new Date(sketch.updatedAt), 'MMM D, YYYY h:mm A')}</td>
                </tr>)}
            </tbody>
          </table>}
      </div>
    );
  }
}

SketchList.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string
  }).isRequired,
  getProjects: PropTypes.func.isRequired,
  sort: PropTypes.func.isRequired,
  sketches: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired
  })).isRequired,
  username: PropTypes.string,
  deleteProject: PropTypes.func.isRequired
};

SketchList.defaultProps = {
  username: undefined
};

function mapStateToProps(state) {
  return {
    user: state.user,
    sketches: state.sketches
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({}, SketchActions, ProjectActions, ToastActions), dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SketchList);
