import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import styled from 'styled-components';
import Header from '../../components/mobile/Header';
import PreviewFrame from '../IDE/components/PreviewFrame';
import Screen from '../../components/mobile/MobileScreen';
import * as ProjectActions from '../IDE/actions/project';
import { getHTMLFile, getJSFiles, getCSSFiles } from '../IDE/reducers/files';


import { ExitIcon } from '../../common/Icons';
import { remSize } from '../../theme';


const Content = styled.div`
  z-index: 0;
  margin-top: ${remSize(48)};
`;

const IconLinkWrapper = styled(Link)`
  width: 2rem;
  margin-right: 1.25rem;
  margin-left: none;
`;

const noop = () => {};

const MobileSketchView = (props) => {
  const [overlay, setOverlay] = useState(null);


  // TODO: useSelector requires react-redux ^7.1.0
  // const htmlFile = useSelector(state => getHTMLFile(state.files));
  // const jsFiles = useSelector(state => getJSFiles(state.files));
  // const cssFiles = useSelector(state => getCSSFiles(state.files));
  // const files = useSelector(state => state.files);

  const {
    htmlFile, jsFiles, cssFiles, files, params, getProject
  } = props;

  useEffect(() => {
    console.log(params);
    getProject(params.project_id, params.username);
  }, []);

  return (
    <Screen>
      <Header>
        <IconLinkWrapper to="/mobile" aria-label="Return to original editor">
          <ExitIcon viewBox="0 0 16 16" />
        </IconLinkWrapper>
        <div>
          <h2>Hello</h2>
          {/* <h3>{selectedFile.name}</h3> */}
        </div>

        {/* <div style={{ marginLeft: '2rem' }}>
          <IconButton onClick={() => setOverlay('preferences')}>
            <PreferencesIcon focusable="false" aria-hidden="true" />
          </IconButton>
          <IconButton onClick={() => setOverlay('runSketch')}>
            <PlayIcon viewBox="-1 -1 7 7" focusable="false" aria-hidden="true" />
          </IconButton>
        </div> */}
      </Header>
      <Content>
        <h1>Hello</h1>
        <PreviewFrame
          htmlFile={htmlFile}
          jsFiles={jsFiles}
          cssFiles={cssFiles}
          files={files}
          head={
            <link type="text/css" rel="stylesheet" href="/preview-styles.css" />
          }
          fullView
          isPlaying
          isAccessibleOutputPlaying={false}
          textOutput={false}
          gridOutput={false}
          soundOutput={false}
          dispatchConsoleEvent={noop}
          endSketchRefresh={noop}
          previewIsRefreshing={false}
          setBlobUrl={noop}
          stopSketch={noop}
          expandConsole={noop}
          clearConsole={noop}
        />
      </Content>
    </Screen>);
};

MobileSketchView.propTypes = {
  params: PropTypes.shape({
    project_id: PropTypes.string,
    username: PropTypes.string
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
  files: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  })).isRequired,
  getProject: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
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

export default connect(mapStateToProps, mapDispatchToProps)(MobileSketchView);
