import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { withTranslation } from 'react-i18next';

import Button from '../../../common/Button';
import Nav from '../../../components/Nav';
import Overlay from '../../App/components/Overlay';
import AssetSize from '../../IDE/components/AssetSize';
import Table from '../../IDE/components/Table';

import CollectionCreate from '../components/CollectionCreate';
import DashboardTabSwitcherPublic, {
  TabKey
} from '../components/DashboardTabSwitcher';
import SearchBar from '../../IDE/components/Searchbar/SearchBar';

class DashboardView extends React.Component {
  static defaultProps = {
    user: null
  };

  constructor(props) {
    super(props);
    this.closeAccountPage = this.closeAccountPage.bind(this);
    this.gotoHomePage = this.gotoHomePage.bind(this);
    this.state = {
      searchTerm: ''
    };
  }

  componentDidMount() {
    document.body.className = this.props.theme;
  }

  closeAccountPage() {
    browserHistory.push(this.props.previousPath);
  }

  gotoHomePage() {
    browserHistory.push('/');
  }

  handleChangeSearchTerm = (val) => {
    this.setState({ searchTerm: val });
  };

  selectedTabKey() {
    const path = this.props.location.pathname;

    if (/assets/.test(path)) {
      return TabKey.assets;
    } else if (/collections/.test(path)) {
      return TabKey.collections;
    }

    return TabKey.sketches;
  }

  ownerName() {
    if (this.props.params.username) {
      return this.props.params.username;
    }

    return this.props.user.username;
  }

  isOwner() {
    return this.props.user.username === this.props.params.username;
  }

  isCollectionCreate() {
    const path = this.props.location.pathname;
    return /collections\/create$/.test(path);
  }

  returnToDashboard = () => {
    browserHistory.push(`/${this.ownerName()}/collections`);
  };

  renderActionButton(tabKey, username, t) {
    switch (tabKey) {
      case TabKey.assets:
        return this.isOwner() && <AssetSize />;
      case TabKey.collections:
        return (
          this.isOwner() && (
            <React.Fragment>
              <Button to={`/${username}/collections/create`}>
                {t('DashboardView.CreateCollection')}
              </Button>
              <SearchBar
                onChangeSearchTerm={this.handleChangeSearchTerm}
                searchTerm={this.state.searchTerm}
              />
            </React.Fragment>
          )
        );
      case TabKey.sketches:
      default:
        return (
          <React.Fragment>
            {this.isOwner() && (
              <Button to="/">{t('DashboardView.NewSketch')}</Button>
            )}
            <SearchBar
              onChangeSearchTerm={this.handleChangeSearchTerm}
              searchTerm={this.state.searchTerm}
            />
          </React.Fragment>
        );
    }
  }

  renderContent(tabKey, username) {
    const CollectionListeaderRow = [
      { field: 'name', name: 'CollectionList.HeaderName' },
      { field: 'createdAt', name: 'CollectionList.HeaderCreatedAt' },
      { field: 'updatedAt', name: 'CollectionList.HeaderUpdatedAt' },
      { field: 'numItems', name: 'CollectionList.HeaderNumItems' }
    ];
    const SketchListHeaderRow = [
      { field: 'name', name: 'SketchList.HeaderName' },
      { field: 'createdAt', name: 'SketchList.HeaderCreatedAt' },
      { field: 'updatedAt', name: 'SketchList.HeaderUpdatedAt' }
    ];
    const AssetListRowHeader = [
      { field: 'name', name: 'AssetList.HeaderName' },
      { field: 'size', name: 'AssetList.HeaderSize' },
      { field: 'sketchName', name: 'AssetList.HeaderSketch' }
    ];
    switch (tabKey) {
      case TabKey.assets:
        return (
          <Table
            key={username}
            username={username}
            headerRow={AssetListRowHeader}
            dataRows={this.props.assetList}
            listType="AssetList"
            searchTerm={this.state.searchTerm}
          />
        );
      case TabKey.collections:
        return (
          <Table
            key={username}
            username={username}
            headerRow={CollectionListeaderRow}
            dataRows={this.props.collections}
            listType="CollectionList"
            searchTerm={this.state.searchTerm}
          />
        );
      case TabKey.sketches:
      default:
        return (
          <Table
            key={username}
            username={username}
            headerRow={SketchListHeaderRow}
            dataRows={this.props.sketches}
            listType="SketchList"
            searchTerm={this.state.searchTerm}
          />
        );
    }
  }

  render() {
    const currentTab = this.selectedTabKey();
    const isOwner = this.isOwner();
    const { username } = this.props.params;
    const actions = this.renderActionButton(currentTab, username, this.props.t);

    return (
      <div className="dashboard">
        <Nav layout="dashboard" />

        <main className="dashboard-header">
          <div className="dashboard-header__header">
            <h2 className="dashboard-header__header__title">
              {this.ownerName()}
            </h2>
            <div className="dashboard-header__nav">
              <DashboardTabSwitcherPublic
                currentTab={currentTab}
                isOwner={isOwner}
                username={username}
              />
              {actions && (
                <div className="dashboard-header__actions">{actions}</div>
              )}
            </div>
          </div>

          <div className="dashboard-content">
            {this.renderContent(currentTab, username)}
          </div>
        </main>
        {this.isCollectionCreate() && (
          <Overlay
            title={this.props.t('DashboardView.CreateCollectionOverlay')}
            closeOverlay={this.returnToDashboard}
          >
            <CollectionCreate />
          </Overlay>
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    previousPath: state.ide.previousPath,
    user: state.user,
    theme: state.preferences.theme,
    collections: state.collections,
    sketches: state.sketches,
    assetList: state.assets.list
  };
}

DashboardView.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired
  }).isRequired,
  params: PropTypes.shape({
    username: PropTypes.string.isRequired
  }).isRequired,
  previousPath: PropTypes.string.isRequired,
  theme: PropTypes.string.isRequired,
  user: PropTypes.shape({
    username: PropTypes.string
  }),
  collections: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      createdAt: PropTypes.string.isRequired,
      updatedAt: PropTypes.string.isRequired
    })
  ).isRequired,
  sketches: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
      updatedAt: PropTypes.string.isRequired
    })
  ).isRequired,
  assetList: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      sketchName: PropTypes.string,
      sketchId: PropTypes.string
    })
  ).isRequired,
  t: PropTypes.func.isRequired
};

export default withTranslation()(connect(mapStateToProps)(DashboardView));
