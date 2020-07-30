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
import { SketchSearchbar } from '../IDE/components/Searchbar';

const EXAMPLE_USERNAME = 'p5';

const FooterTab = styled.div`
  background: ${props => prop(props.selected ? 'backgroundColor' : 'MobilePanel.default.foreground')};
  color: ${props => prop(`MobilePanel.default.${props.selected ? 'foreground' : 'background'}`)};
  padding: ${remSize(16)};
  width: 100%;
  display: flex;
`;

const Subheader = styled.div`

  .searchbar {
    display: flex;
    * {
      border-radius: 0px;
    }
  }
  .searchbar__input { width: 100%; }
`;


const FooterTabSwitcher = styled.div`
  display: flex;
  
  h3 { text-align: center; width: 100%; }
`;

const Panels = {
  Sketches: props => <SketchList {...props} />,
  Collections: props => <CollectionList {...props} />,
  Assets: props => <AssetList {...props} />
};

const MobileDashboard = ({ username }) => {
  const Tabs = Object.keys(Panels);
  const [selected, selectTab] = useState(Tabs[0]);

  const isExamples = username === EXAMPLE_USERNAME;

  return (
    <Screen fullscreen>
      <Header slim inverted title={isExamples ? 'Examples' : 'My Stuff'}>
        <IconButton to="/mobile" icon={ExitIcon} aria-label="Return to ide view" />
      </Header>


      <Content slimheader>
        <Subheader>
          <SketchSearchbar />
        </Subheader>
        {Panels[selected] && Panels[selected]({ username })}
      </Content>

      <Footer>
        {!isExamples &&
          <FooterTabSwitcher>
            {Tabs.map(tab => (
              <FooterTab
                key={`tab-${tab}`}
                selected={tab === selected}
                onClick={() => selectTab(tab)}
              >
                <h3>{(tab === 'Sketches' && username === 'p5') ? 'Examples' : tab}</h3>
              </FooterTab>))
            }
          </FooterTabSwitcher>
        }
      </Footer>
    </Screen>);
};

MobileDashboard.propTypes = { username: PropTypes.string };
MobileDashboard.defaultProps = { username: '' };


export default MobileDashboard;
