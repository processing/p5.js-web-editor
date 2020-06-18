import React, { useState } from 'react';
import { Link } from 'react-router';
import styled from 'styled-components';
import Header from '../../components/mobile/Header';
import Screen from '../../components/mobile/MobileScreen';
import { ExitIcon } from '../../common/Icons';

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
    </Screen>);
};
export default MobileSketchView;
