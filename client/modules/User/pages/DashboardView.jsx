import React, { useState } from 'react';
import { connect } from 'react-redux';
import MediaQuery from 'react-responsive';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import Button from '../../../common/Button';
import Nav from '../../IDE/components/Header/Nav';
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

function DashboardView(props) {
  const [collectionCreateVisible, setCollectionCreateVisible] = useState(false);

  const createNewSketch = () => {
    props.newProject();
  };

  const selectedTabKey = () => {
    const path = props.location.pathname;

    if (/assets/.test(path)) {
      return TabKey.assets;
    } else if (/collections/.test(path)) {
      return TabKey.collections;
    }

    return TabKey.sketches;
  };

  const ownerName = () => {
    if (props.params.username) {
      return props.params.username;
    }

    return props.user.username;
  };

  const isOwner = () => props.user.username === props.params.username;

  const toggleCollectionCreate = () => {
    setCollectionCreateVisible((prevState) => !prevState);
  };

  const renderActionButton = (tabKey, username, t) => {
    switch (tabKey) {
      case TabKey.assets:
        return isOwner() && <AssetSize />;
      case TabKey.collections:
        return (
          isOwner() && (
            <>
              <Button onClick={toggleCollectionCreate}>
                {t('DashboardView.CreateCollection')}
              </Button>
              <CollectionSearchbar />
            </>
          )
        );
      case TabKey.sketches:
      default:
        return (
          <>
            {isOwner() && (
              <Button onClick={createNewSketch}>
                {t('DashboardView.NewSketch')}
              </Button>
            )}
            <SketchSearchbar />
          </>
        );
    }
  };

  const renderContent = (tabKey, username, mobile) => {
    switch (tabKey) {
      case TabKey.assets:
        return <AssetList key={username} mobile={mobile} username={username} />;
      case TabKey.collections:
        return (
          <CollectionList key={username} mobile={mobile} username={username} />
        );
      case TabKey.sketches:
      default:
        return (
          <SketchList key={username} mobile={mobile} username={username} />
        );
    }
  };

  const currentTab = selectedTabKey();
  const isOwnerFlag = isOwner();
  const { username } = props.params;
  const actions = renderActionButton(currentTab, username, props.t);

  return (
    <RootPage fixedHeight="100%">
      <Nav layout="dashboard" />

      <main className="dashboard-header">
        <div className="dashboard-header__header">
          <h2 className="dashboard-header__header__title">{ownerName()}</h2>
          <div className="dashboard-header__nav">
            <DashboardTabSwitcherPublic
              currentTab={currentTab}
              isOwner={isOwnerFlag}
              username={username}
            />
            {actions && (
              <div className="dashboard-header__actions">{actions}</div>
            )}
          </div>
        </div>

        <div className="dashboard-content">
          <MediaQuery maxWidth={770}>
            {(mobile) => renderContent(currentTab, username, mobile)}
          </MediaQuery>
        </div>
      </main>
      {collectionCreateVisible && (
        <Overlay
          title={props.t('DashboardView.CreateCollectionOverlay')}
          closeOverlay={toggleCollectionCreate}
        >
          <CollectionCreate />
        </Overlay>
      )}
    </RootPage>
  );
}

function mapStateToProps(state) {
  return {
    previousPath: state.ide.previousPath,
    user: state.user
  };
}

const mapDispatchToProps = {
  ...ProjectActions
};

DashboardView.defaultProps = {
  user: null // Provide an appropriate default value
};

DashboardView.propTypes = {
  newProject: PropTypes.func.isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired
  }).isRequired,
  params: PropTypes.shape({
    username: PropTypes.string.isRequired
  }).isRequired,
  user: PropTypes.shape({
    username: PropTypes.string
  }),
  t: PropTypes.func.isRequired
};

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(DashboardView)
);
