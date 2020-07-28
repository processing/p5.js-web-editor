import React, { useState } from 'react';
import PropTypes from 'prop-types';
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
  Sketches: props => <SketchList {...props} />,
  Collections: () => <CollectionList />,
  Assets: () => <AssetList />
};

const MobileDashboard = ({ username }) => {
  // const tabs = ['Sketches', 'Collections', 'Assets'];
  const Tabs = Object.keys(Panels);
  const [selected, selectTab] = useState(Tabs[0]);

  const isExamples = username === 'p5';

  return (
    <Screen fullscreen>
      <Header slim inverted title={isExamples ? 'Examples' : 'My Stuff'}>
        <IconButton to="/mobile" icon={ExitIcon} aria-label="Return to ide view" />
      </Header>


      <Content>
        {Panels[selected] && Panels[selected]({ username })}
      </Content>


      <Footer>
        {!isExamples &&
          <FooterTabContainer>
            {Tabs.map(tab => (
              <FooterTab
                key={`tab-${tab}`}
                selected={tab === selected}
                onClick={() => selectTab(tab)}
              >
                <h3>{(tab === 'Sketches' && username === 'p5') ? 'Examples' : tab}</h3>
              </FooterTab>))
            }
          </FooterTabContainer>
        }
      </Footer>
    </Screen>);
};

MobileDashboard.propTypes = { username: PropTypes.string };
MobileDashboard.defaultProps = { username: '' };


export default MobileDashboard;
