import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { withRouter } from 'react-router';

import Screen from '../../components/mobile/MobileScreen';
import Header from '../../components/mobile/Header';
import IconButton from '../../components/mobile/IconButton';
import { ExitIcon, MoreIcon } from '../../common/icons';
import Footer from '../../components/mobile/Footer';
import { remSize, prop } from '../../theme';
import SketchList from '../IDE/components/SketchList';
import CollectionList from '../IDE/components/CollectionList';
import AssetList from '../IDE/components/AssetList';
import Content from './MobileViewContent';
import { SketchSearchbar, CollectionSearchbar } from '../IDE/components/Searchbar';
import Button from '../../common/Button';
import useAsModal from '../../components/useAsModal';
import Dropdown from '../../components/Dropdown';
import FooterTabSwitcher from '../../components/mobile/TabSwitcher';
import FooterTab from '../../components/mobile/Tab';
import Loader from '../App/components/loader';

const EXAMPLE_USERNAME = 'p5';

const ContentWrapper = styled(Content)`
  table {
    table-layout: fixed;
  }
  
  td ,thead button {
    font-size: ${remSize(10)};
    text-align: left;
  };

  tbody th {
    font-size: ${remSize(16)};
    width: 100%;
    padding-right: ${remSize(12)};
    font-weight: bold;
    display: flex;
    grid-area: name;
  };

  tbody td, thead th {
    justify-self: center;
    align-self: flex-end;
    color: ${prop('primaryTextColor')}
  }


  thead th svg { margin-left: ${remSize(8)} }
  
  
  tbody td              { justify-self: start; text-align: start; padding: 0 }
  tbody td:nth-child(2) { justify-self: start;  text-align: start; padding-left: ${remSize(12)}};
  tbody td:last-child   { justify-self: end;    text-align: end; };

  .sketch-list__dropdown-column { width: auto; };

  tbody { height: ${remSize(48)}; }

  .sketches-table-container {
    background: ${prop('SketchList.background')};
    }
  .sketches-table__row {
    background: ${prop('SketchList.card.background')} !important;
    height: auto
  }
  


  tr {
    align-self: start;
    display: grid;
    box-shadow: 0 0 18px 0 ${prop('shadowColor')};
  };

  thead tr {
    grid-template-columns: 1fr 1fr 1fr 0fr;
  }

  tbody tr {
    padding: ${remSize(8)};
    border-radius: ${remSize(4)};
    grid-template-columns: 5fr 5fr 1fr;
    grid-template-areas: "name name name" "content content content";
  }

  .loader-container { position: fixed ; padding-bottom: 32% }

  .sketches-table thead th {
    background-color: transparent;
  }

  .asset-table thead th {
    height: initial;
    align-self: center;
  }

  .asset-table thead tr {
    height: ${remSize(32)}
  }

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
        {renderPanel(panel, { username: paramsUsername, key: pathname })}
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
