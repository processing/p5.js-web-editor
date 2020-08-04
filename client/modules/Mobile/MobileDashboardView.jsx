import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { withRouter, Link } from 'react-router';

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
import { SketchSearchbar, CollectionSearchbar } from '../IDE/components/Searchbar';
import Button from '../../common/Button';

const EXAMPLE_USERNAME = 'p5';

const ContentWrapper = styled(Content)`
  table {
    table-layout: fixed;
    /* white-space: nowrap; */
  }
  
  td ,thead button {
    font-size: ${remSize(10)};
    padding-left: 0;
    text-align: left;
  };

  thead th { padding-left: 0; }

  thead th:not(:first-child), tbody td  {
    width: ${remSize(54)};
  }

  tbody th { font-weight: bold; };

  tbody th {
    font-size: ${remSize(12)};
    width: 100%;
    padding-right: ${remSize(12)}
  };

  tbody td {
    text-align: center;
  }

  .sketch-list__sort-button { padding: 0 }
  tbody {
    height: ${remSize(48)};
  }

  .sketches-table-container { padding-bottom: ${remSize(160)} }
`;

const FooterTab = styled(Link)`
  background: ${props => prop(props.selected ? 'backgroundColor' : 'MobilePanel.default.foreground')};
  color: ${props => prop(`MobilePanel.default.${props.selected ? 'foreground' : 'background'}`)};
  padding: ${remSize(8)} ${remSize(16)};
  width: 100%;
  display: flex;
`;

const Subheader = styled.div`
  display: flex;
  flex-direction: row;
  * { border-radius: 0px; }

  .searchbar {
    display: flex;
    width: 100%;
  }
  .searchbar__input { width: 100%; }
`;

const SubheaderButton = styled(Button)`
  border-radius: 0px !important;
`;


const FooterTabSwitcher = styled.div`
  display: flex;
  
  h3 { text-align: center; width: 100%; }
`;

const Panels = {
  sketches: SketchList,
  collections: CollectionList,
  assets: AssetList
};

const CreatePathname = {
  sketches: '/mobile',
  collections: '/mobile/:username/collections/create',
};


const getPanel = (pathname) => {
  const pathparts = pathname ? pathname.split('/') : [];
  const matches = Object.keys(Panels).map(part => part.toLowerCase()).filter(part => pathparts.includes(part));
  return matches && matches.length > 0 && matches[0];
};

const getCreatePathname = (panel, username) => (CreatePathname[panel] || '#').replace(':username', username);

const isOwner = (user, params) => user && params && user.username === params.username;

const renderPanel = (name, props) => (Component => (Component && <Component {...props} mobile />))(Panels[name]);

const MobileDashboard = ({ params, location }) => {
  const user = useSelector(state => state.user);
  const { username } = params;
  const { pathname } = location;

  const Tabs = Object.keys(Panels);
  const isExamples = username === EXAMPLE_USERNAME;
  const panel = getPanel(pathname);

  return (
    <Screen fullscreen key={pathname}>
      <Header slim inverted title={isExamples ? 'Examples' : 'My Stuff'}>
        <IconButton to="/mobile" icon={ExitIcon} aria-label="Return to ide view" />
      </Header>


      <ContentWrapper slimheader>
        <Subheader>
          {isOwner(user, params) && (panel !== Tabs[2]) && <SubheaderButton to={getCreatePathname(panel, username)}>new</SubheaderButton>}
          {panel === Tabs[0] && <SketchSearchbar />}
          {panel === Tabs[1] && <CollectionSearchbar />}
        </Subheader>
        {renderPanel(panel, { username, key: pathname })}
      </ContentWrapper>
      <Footer>
        {!isExamples &&
          <FooterTabSwitcher>
            {Tabs.map(tab => (
              <FooterTab
                key={`tab-${tab}`}
                selected={tab === panel}
                to={pathname.replace(panel, tab)}
              >
                <h3>{(isExamples && tab === 'Sketches') ? 'Examples' : tab}</h3>
              </FooterTab>))
            }
          </FooterTabSwitcher>
        }
      </Footer>
    </Screen>);
};


MobileDashboard.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired
  }).isRequired,
  params: PropTypes.shape({
    username: PropTypes.string.isRequired
  })
};
MobileDashboard.defaultProps = { params: {} };


export default withRouter(MobileDashboard);
