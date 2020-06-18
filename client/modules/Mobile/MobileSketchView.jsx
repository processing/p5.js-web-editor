import React, { useState } from 'react';

import Header from '../../components/mobile/Header';
import Screen from '../../components/mobile/MobileScreen';

const MobileSketchView = (props) => {
  const [overlay, setOverlay] = useState(null);
  return (
    <Screen>
      <Header>
        {/* <IconLinkWrapper to="/mobile" aria-label="Return to original editor">
        <CloseIcon viewBox="20 21 60 60" />
      </IconLinkWrapper> */}
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
