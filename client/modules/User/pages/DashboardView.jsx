import PropTypes from 'prop-types';
import React, { useState, useCallback } from 'react';
import { connect } from 'react-redux';
import MediaQuery from 'react-responsive';
import { withTranslation } from 'react-i18next';

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

const DashboardView = ({ newProject, location, params, user, t }) => {
  const [collectionCreateVisible, setCollectionCreateVisible] = useState(false);

  const createNewSketch = () => {
    newProject();
  };

  const selectedTabKey = useCallback(() => {
    const path = location.pathname;

    if (/assets/.test(path)) {
      return TabKey.assets;
    } else if (/collections/.test(path)) {
      return TabKey.collections;
    }

    return TabKey.sketches;
  }, [location.pathname]);

  const ownerName = () => {
    if (params.username) {
      return params.username;
    }

    return user.username;
  };

  const isOwner = () => params.username === user.username;

  const toggleCollectionCreate = () => {
    setCollectionCreateVisible((prevState) => !prevState);
  };

  const renderActionButton = (tabKey) => {
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
  const actions = renderActionButton(currentTab);

  return (
    <RootPage fixedHeight="100%">
      <Nav layout="dashboard" />

      <main className="dashboard-header">
        <div className="dashboard-header__header">
          <h2 className="dashboard-header__header__title">{ownerName()}</h2>
          <div className="dashboard-header__nav">
            <DashboardTabSwitcherPublic
              currentTab={currentTab}
              isOwner={isOwner()}
              username={params.username}
            />
            {actions && (
              <div className="dashboard-header__actions">{actions}</div>
            )}
          </div>
        </div>

        <div className="dashboard-content">
          <MediaQuery maxWidth={770}>
            {(mobile) => renderContent(currentTab, params.username, mobile)}
          </MediaQuery>
        </div>
      </main>
      {collectionCreateVisible && (
        <Overlay
          title={t('DashboardView.CreateCollectionOverlay')}
          closeOverlay={toggleCollectionCreate}
        >
          <CollectionCreate />
        </Overlay>
      )}
    </RootPage>
  );
};

DashboardView.defaultProps = {
  user: null
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

const mapStateToProps = (state) => ({
  previousPath: state.ide.previousPath,
  user: state.user
});

const mapDispatchToProps = {
  ...ProjectActions
};

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(DashboardView)
);
