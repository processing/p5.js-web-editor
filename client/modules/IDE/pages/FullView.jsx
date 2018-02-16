import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PreviewFrame from '../components/PreviewFrame';
import { getHTMLFile, getJSFiles, getCSSFiles } from '../reducers/files';
import * as ProjectActions from '../actions/project';


class FullView extends React.Component {
  componentDidMount() {
    this.props.getProject(this.props.params.project_id);
  }

  render() {
    return (
      <div className="fullscreen-preview">
        <h1 className="fullscreen-preview__title">
          {this.props.project.name} {this.props.project.owner ? `by ${this.props.project.owner.username}` : ''}
        </h1>
        <div className="fullscreen-preview__frame-wrapper">
          <PreviewFrame
            htmlFile={this.props.htmlFile}
            jsFiles={this.props.jsFiles}
            cssFiles={this.props.cssFiles}
            files={this.props.files}
            head={
              <link type="text/css" rel="stylesheet" href="/preview-styles.css" />
            }
            fullView
            isPlaying
          />
        </div>
      </div>
    );
  }
}

FullView.propTypes = {
  params: PropTypes.shape({
    project_id: PropTypes.string
  }).isRequired,
  project: PropTypes.shape({
    name: PropTypes.string,
    owner: PropTypes.shape({
      username: PropTypes.string
    })
  }).isRequired,
  htmlFile: PropTypes.shape({
    id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }).isRequired,
  jsFiles: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  })).isRequired,
  cssFiles: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  })).isRequired,
  getProject: PropTypes.func.isRequired,
  files: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  })).isRequired,
};

function mapStateToProps(state) {
  return {
    user: state.user,
    htmlFile: getHTMLFile(state.files),
    jsFiles: getJSFiles(state.files),
    cssFiles: getCSSFiles(state.files),
    project: state.project,
    files: state.files
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(ProjectActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(FullView);
