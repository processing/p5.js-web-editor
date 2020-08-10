import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { withRouter, Link } from 'react-router';

import Screen from '../../components/mobile/MobileScreen';
import Header from '../../components/mobile/Header';
import IconButton from '../../components/mobile/IconButton';
import { ExitIcon, MoreIcon } from '../../common/icons';
import Footer from '../../components/mobile/Footer';
import { prop, remSize } from '../../theme';
import SketchList from '../IDE/components/SketchList';
import CollectionList from '../IDE/components/CollectionList';
import AssetList from '../IDE/components/AssetList';
import Content from './MobileViewContent';
import { SketchSearchbar, CollectionSearchbar } from '../IDE/components/Searchbar';
import Button from '../../common/Button';
import useAsModal from '../../components/useAsModal';
import Dropdown from '../../components/Dropdown';

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

const FooterTabSwitcher = styled.div`
  display: flex;
  justify-content: space-between;
  
  h3 { text-align: center; width: 100%; }
  border-top: 1px solid ${prop('Separator')};

  background: ${props => prop('backgroundColor')};
`;

const FooterTab = styled(Link)`
  box-sizing: border-box;


  background: transparent;
  /* border-top: ${remSize(4)} solid ${props => prop(props.selected ? 'colors.p5jsPink' : 'MobilePanel.default.background')}; */
  border-top: ${remSize(4)} solid ${props => (props.selected ? prop('colors.p5jsPink') : 'transparent')};

  color: ${prop('primaryTextColor')};

  padding: ${remSize(8)} ${remSize(16)};
  width: 30%;
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

const Panels = {
  sketches: SketchList,
  collections: CollectionList,
  assets: AssetList
};


const navOptions = username => [
  { title: 'Create Sketch', href: '/mobile' },
  { title: 'Create Collection', href: `/mobile/${username}/collections/create` }
];


const getPanel = (pathname) => {
  const pathparts = pathname ? pathname.split('/') : [];
  const matches = Object.keys(Panels).map(part => part.toLowerCase()).filter(part => pathparts.includes(part));
  return matches && matches.length > 0 && matches[0];
};

const NavItem = styled.li`
  position: relative;
`;


const isOwner = (user, params) => user && params && user.username === params.username;

const renderPanel = (name, props) => (Component => (Component && <Component {...props} mobile />))(Panels[name]);

const MobileDashboard = ({ params, location }) => {
  const user = useSelector(state => state.user);
  const { username: paramsUsername } = params;
  const { pathname } = location;

  const Tabs = Object.keys(Panels);
  const isExamples = paramsUsername === EXAMPLE_USERNAME;
  const panel = getPanel(pathname);


  const [toggleNavDropdown, NavDropdown] = useAsModal(<Dropdown
    items={navOptions(user.username)}
    align="right"
  />);

  return (
    <Screen fullscreen key={pathname}>
      <Header slim inverted title={isExamples ? 'Examples' : 'My Stuff'}>
        <NavItem>
          <IconButton
            onClick={toggleNavDropdown}
            icon={MoreIcon}
            aria-label="Options"
          />
          <NavDropdown />

        </NavItem>
        <IconButton to="/mobile" icon={ExitIcon} aria-label="Return to ide view" />
      </Header>


      <ContentWrapper slimheader>
        <Subheader>
          {panel === Tabs[0] && <SketchSearchbar />}
          {panel === Tabs[1] && <CollectionSearchbar />}
        </Subheader>
        {renderPanel(panel, { paramsUsername, key: pathname })}
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
