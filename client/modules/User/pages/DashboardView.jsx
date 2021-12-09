import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { withTranslation } from 'react-i18next';

import Button from '../../../common/Button';
import Nav from '../../../components/Nav';
import Overlay from '../../App/components/Overlay';
import AssetList from '../../IDE/components/AssetList';
import AssetSize from '../../IDE/components/AssetSize';
import CollectionList from '../../IDE/components/CollectionList';
import SketchList from '../../IDE/components/SketchList';
import RootPage from '../../../components/RootPage';
import * as ProjectActions from '../../IDE/actions/project';
import {
  CollectionSearchbar,
  SketchSearchbar
} from '../../IDE/components/Searchbar';

import CollectionCreate from '../components/CollectionCreate';
import DashboardTabSwitcherPublic, {
  TabKey
} from '../components/DashboardTabSwitcher';

class DashboardView extends React.Component {
  static defaultProps = {
    user: null
  };

  constructor(props) {
    super(props);
    this.closeAccountPage = this.closeAccountPage.bind(this);
    this.createNewSketch = this.createNewSketch.bind(this);
    this.gotoHomePage = this.gotoHomePage.bind(this);
    this.toggleCollectionCreate = this.toggleCollectionCreate.bind(this);
    this.state = {
      collectionCreateVisible: false
    };
  }

  componentDidMount() {
    document.body.className = this.props.theme;
  }

  closeAccountPage() {
    browserHistory.push(this.props.previousPath);
  }

  createNewSketch() {
    this.props.newProject();
  }

  gotoHomePage() {
    browserHistory.push('/');
  }

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

  toggleCollectionCreate() {
    this.setState((prevState) => ({
      collectionCreateVisible: !prevState.collectionCreateVisible
    }));
  }

  renderActionButton(tabKey, username, t) {
    switch (tabKey) {
      case TabKey.assets:
        return this.isOwner() && <AssetSize />;
      case TabKey.collections:
        return (
          this.isOwner() && (
            <React.Fragment>
              <Button onClick={this.toggleCollectionCreate}>
                {t('DashboardView.CreateCollection')}
              </Button>
              <CollectionSearchbar />
            </React.Fragment>
          )
        );
      case TabKey.sketches:
      default:
        return (
          <React.Fragment>
            {this.isOwner() && (
              <Button onClick={this.createNewSketch}>
                {t('DashboardView.NewSketch')}
              </Button>
            )}
            <SketchSearchbar />
          </React.Fragment>
        );
    }
  }

  renderContent(tabKey, username) {
    switch (tabKey) {
      case TabKey.assets:
        return <AssetList key={username} username={username} />;
      case TabKey.collections:
        return <CollectionList key={username} username={username} />;
      case TabKey.sketches:
      default:
        return <SketchList key={username} username={username} />;
    }
  }

  render() {
    const currentTab = this.selectedTabKey();
    const isOwner = this.isOwner();
    const { username } = this.props.params;
    const actions = this.renderActionButton(currentTab, username, this.props.t);

    return (
      <RootPage fixedHeight="100%">
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
        {this.state.collectionCreateVisible && (
          <Overlay
            title={this.props.t('DashboardView.CreateCollectionOverlay')}
            closeOverlay={this.toggleCollectionCreate}
          >
            <CollectionCreate />
          </Overlay>
        )}
      </RootPage>
    );
  }
}

function mapStateToProps(state) {
  return {
    previousPath: state.ide.previousPath,
    user: state.user,
    theme: state.preferences.theme
  };
}

const mapDispatchToProps = {
  ...ProjectActions
};

DashboardView.propTypes = {
  newProject: PropTypes.func.isRequired,
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
  t: PropTypes.func.isRequired
};

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(DashboardView)
);
