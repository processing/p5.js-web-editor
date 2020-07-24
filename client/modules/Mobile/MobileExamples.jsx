import React, { useState } from 'react';
import { bindActionCreators } from 'redux';
import styled from 'styled-components';
import Screen from '../../components/mobile/MobileScreen';
import Header from '../../components/mobile/Header';
import IconButton from '../../components/mobile/IconButton';
import { ExitIcon } from '../../common/icons';
import Footer from '../../components/mobile/Footer';
import { prop, remSize } from '../../theme';

const FooterTab = styled.div`
  background: ${props => prop(`MobilePanel.default.${props.selected ? 'background' : 'foreground'}`)};
  color: ${props => prop(`MobilePanel.default.${props.selected ? 'foreground' : 'background'}`)};
  padding: ${remSize(16)};
  width: 100%;
  display: flex;
`;

const FooterTabContainer = styled.div`
  display: flex;
  
  h3 { text-align: center; width: 100%;}
`;


const MobileExamples = () => {
  const tabs = ['Sketches', 'Collections', 'Assets'];
  const [selected, selectTab] = useState(tabs[0]);
  return (
    <Screen fullscreen>
      <Header inverted title="My Stuff">
        <IconButton to="/mobile" icon={ExitIcon} aria-label="Return to ide view" />
      </Header>

      <Footer>
        <FooterTabContainer>

          {tabs.map(tab => (
            <FooterTab selected={tab === selected} onClick={() => selectTab(tab)}>
              <h3>{tab}</h3>
            </FooterTab>))
          }
        </FooterTabContainer>
      </Footer>
    </Screen>);
};

export default MobileExamples;
