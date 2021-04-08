import PropTypes from 'prop-types';
import React from 'react';
import Helmet from 'react-helmet';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PreviewFrame from '../components/PreviewFrame';
import PreviewNav from '../../../components/PreviewNav';
import { getProject } from '../actions/project';
import { startSketch } from '../actions/ide';

class FullView extends React.Component {
  componentDidMount() {
    this.props
      .getProject(this.props.params.project_id, this.props.params.username)
      .then(this.props.startSketch);
  }

  render() {
    return (
      <div className="fullscreen-preview">
        <Helmet>
          <title>{this.props.project.name}</title>
        </Helmet>
        <PreviewNav
          owner={{
            username: this.props.project.owner
              ? `${this.props.project.owner.username}`
              : ''
          }}
          project={{
            name: this.props.project.name,
            id: this.props.params.project_id
          }}
        />
        <main className="preview-frame-holder">
          <PreviewFrame fullView />
        </main>
      </div>
    );
  }
}

FullView.propTypes = {
  params: PropTypes.shape({
    project_id: PropTypes.string,
    username: PropTypes.string
  }).isRequired,
  project: PropTypes.shape({
    name: PropTypes.string,
    owner: PropTypes.shape({
      username: PropTypes.string
    })
  }).isRequired,
  getProject: PropTypes.func.isRequired,
  startSketch: PropTypes.func.isRequired
};

function mapStateToProps(state) {
  return {
    project: state.project
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ getProject, startSketch }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(FullView);
