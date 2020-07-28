import React, { useState } from 'react';
import { bindActionCreators } from 'redux';
import styled from 'styled-components';
import Screen from '../../components/mobile/MobileScreen';
import Header from '../../components/mobile/Header';
import IconButton from '../../components/mobile/IconButton';
import { ExitIcon } from '../../common/icons';
import Footer from '../../components/mobile/Footer';
import { prop, remSize } from '../../theme';
import SketchList from '../IDE/components/SketchList';
import CollectionList from '../IDE/components/CollectionList';
import AssetList from '../IDE/components/AssetList';
import Content from './MobileViewContent';

const FooterTab = styled.div`
  background: ${props => prop(props.selected ? 'backgroundColor' : 'MobilePanel.default.foreground')};
  color: ${props => prop(`MobilePanel.default.${props.selected ? 'foreground' : 'background'}`)};
  padding: ${remSize(16)};
  width: 100%;
  display: flex;
`;

const FooterTabContainer = styled.div`
  display: flex;
  
  h3 { text-align: center; width: 100%; }
`;

// switch (tabKey) {
//   case TabKey.assets:
//     return <AssetList key={username} username={username} />;
//   case TabKey.collections:
//     return <CollectionList key={username} username={username} />;
//   case TabKey.sketches:
//   default:
//     return <SketchList key={username} username={username} />;
// }

const Panels = {
  Sketches: () => <SketchList />,
  Collections: () => <CollectionList />,
  Assets: () => <AssetList />
};

const MobileExamples = () => {
  // const tabs = ['Sketches', 'Collections', 'Assets'];
  const Tabs = Object.keys(Panels);
  const [selected, selectTab] = useState(Tabs[0]);
  return (
    <Screen fullscreen>
      <Header inverted title="My Stuff">
        <IconButton to="/mobile" icon={ExitIcon} aria-label="Return to ide view" />
      </Header>


      <Content>
        {Panels[selected] && Panels[selected]()}
      </Content>


      <Footer>
        <FooterTabContainer>
          {Tabs.map(tab => (
            <FooterTab
              key={`tab-${tab}`}
              selected={tab === selected}
              onClick={() => selectTab(tab)}
            >
              <h3>{tab}</h3>
            </FooterTab>))
          }
        </FooterTabContainer>
      </Footer>
    </Screen>);
};

export default MobileExamples;
