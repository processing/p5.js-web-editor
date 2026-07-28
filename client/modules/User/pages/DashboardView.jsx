import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Button } from '../../../common/Button';
import Nav from '../../IDE/components/Header/Nav';
import { Overlay } from '../../App/components/Overlay';
import AssetList from '../../IDE/components/AssetList';
import AssetSize from '../../IDE/components/AssetSize';
import CollectionList from '../../IDE/components/CollectionList';
import SketchList from '../../IDE/components/SketchList';
import { RootPage } from '../../../components/RootPage';
import { newProject } from '../../IDE/actions/project';
import {
  CollectionSearchbar,
  SketchSearchbar
} from '../../IDE/components/Searchbar';

import CollectionCreate from '../components/CollectionCreate';
import {
  DashboardTabSwitcher,
  TabKey
} from '../components/DashboardTabSwitcher';
import useIsMobile from '../../IDE/hooks/useIsMobile';
import notFoundRedirect from '../../../utils/notFoundRedirect';
import { getStoredToken } from '../../../utils/opAuth';

const DashboardView = () => {
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  const params = useParams();
  const location = useLocation();

  const dispatch = useDispatch();

  const user = useSelector((state) => state.user);

  const [collectionCreateVisible, setCollectionCreateVisible] = useState(false);

  const createNewSketch = () => {
    dispatch(newProject());
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

  // Assets are only ever the signed-in user's own — AssetList fetches them by
  // the current user's id and ignores the username in the URL — so someone
  // else's /:username/assets isn't a page that exists. Wait for auth
  // hydration first, or the owner gets bounced off their own assets.
  const isHydratingAuth = Boolean(getStoredToken()) && !user.authenticated;

  useEffect(() => {
    if (
      selectedTabKey() === TabKey.assets &&
      params.username &&
      !isHydratingAuth &&
      params.username !== user.username
    ) {
      dispatch(notFoundRedirect('Toast.PageNotFound'));
    }
  }, [
    selectedTabKey,
    params.username,
    user.username,
    isHydratingAuth,
    dispatch
  ]);

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
            <DashboardTabSwitcher
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
          {renderContent(currentTab, params.username, isMobile)}
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

export default DashboardView;
