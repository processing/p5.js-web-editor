import React, { useState } from 'react';
import { Link } from 'react-router';
import styled from 'styled-components';
import Header from '../../components/mobile/Header';
import Screen from '../../components/mobile/MobileScreen';

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


const MobileSketchView = (props) => {
  const [overlay, setOverlay] = useState(null);
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
      </Content>
    </Screen>);
};


export default MobileSketchView;


// <PreviewFrame
//             htmlFile={this.props.htmlFile}
//             jsFiles={this.props.jsFiles}
//             cssFiles={this.props.cssFiles}
//             files={this.props.files}
//             head={
//               <link type="text/css" rel="stylesheet" href="/preview-styles.css" />
//             }
//             fullView
//             isPlaying
//             isAccessibleOutputPlaying={false}
//             textOutput={false}
//             gridOutput={false}
//             soundOutput={false}
//             dispatchConsoleEvent={this.ident}
//             endSketchRefresh={this.ident}
//             previewIsRefreshing={false}
//             setBlobUrl={this.ident}
//             stopSketch={this.ident}
//             expandConsole={this.ident}
//             clearConsole={this.ident}
//           />
