import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { browserHistory, Link } from 'react-router';
import { updateSettings, initiateVerification, createApiKey, removeApiKey } from '../actions';
import Nav from '../../../components/Nav';
import Overlay from '../../App/components/Overlay';

import AssetList from '../../IDE/components/AssetList';
import AssetSize from '../../IDE/components/AssetSize';
import CollectionList from '../../IDE/components/CollectionList';
import SketchList from '../../IDE/components/SketchList';
import { CollectionSearchbar, SketchSearchbar } from '../../IDE/components/Searchbar';

import CollectionCreate from '../components/CollectionCreate';
import DashboardTabSwitcher, { TabKey } from '../components/DashboardTabSwitcher';

class DashboardView extends React.Component {
  static defaultProps = {
    user: null,
  };

  constructor(props) {
    super(props);
    this.closeAccountPage = this.closeAccountPage.bind(this);
    this.gotoHomePage = this.gotoHomePage.bind(this);
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
  }

  renderActionButton(tabKey, username) {
    switch (tabKey) {
      case TabKey.assets:
        return this.isOwner() && <AssetSize />;
      case TabKey.collections:
        return this.isOwner() && (
          <React.Fragment>
            <Link className="dashboard__action-button" to={`/${username}/collections/create`}>
              Create collection
            </Link>
            <CollectionSearchbar />
          </React.Fragment>);
      case TabKey.sketches:
      default:
        return (
          <React.Fragment>
            {this.isOwner() && <Link className="dashboard__action-button" to="/">New sketch</Link>}
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
    const actions = this.renderActionButton(currentTab, username);

    return (
      <div className="dashboard">
        <Nav layout="dashboard" />

        <main className="dashboard-header">
          <div className="dashboard-header__header">
            <h2 className="dashboard-header__header__title">{this.ownerName()}</h2>
            <div className="dashboard-header__nav">
              <DashboardTabSwitcher currentTab={currentTab} isOwner={isOwner} username={username} />
              {actions &&
                <div className="dashboard-header__actions">
                  {actions}
                </div>
              }
            </div>
          </div>

          <div className="dashboard-content">
            {this.renderContent(currentTab, username)}
          </div>
        </main>
        {this.isCollectionCreate() &&
          <Overlay
            title="Create collection"
            closeOverlay={this.returnToDashboard}
          >
            <CollectionCreate />
          </Overlay>
        }
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    previousPath: state.ide.previousPath,
    user: state.user,
    theme: state.preferences.theme,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    updateSettings, initiateVerification, createApiKey, removeApiKey
  }, dispatch);
}

DashboardView.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
  params: PropTypes.shape({
    username: PropTypes.string.isRequired,
  }).isRequired,
  previousPath: PropTypes.string.isRequired,
  theme: PropTypes.string.isRequired,
  user: PropTypes.shape({
    username: PropTypes.string,
  }),
};

export default connect(mapStateToProps, mapDispatchToProps)(DashboardView);
