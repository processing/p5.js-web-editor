import React from 'react';
import { bindActionCreators } from 'redux';
import Screen from '../../components/mobile/MobileScreen';
import Header from '../../components/mobile/Header';
import IconButton from '../../components/mobile/IconButton';
import { ExitIcon } from '../../common/icons';

const MobileExamples = () => (
  <Screen fullscreen>
    <Header transparent title="My Stuff">
      <IconButton to="/mobile" icon={ExitIcon} aria-label="Return to ide view" />
    </Header>
  </Screen>
);

export default MobileExamples;
