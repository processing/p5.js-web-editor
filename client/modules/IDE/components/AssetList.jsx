import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import AssetListRow from './AssetListRow';
import Loader from '../../App/components/loader';
import * as AssetActions from '../actions/assets';

const AssetList = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { username, assetList, loading } = useSelector((state) => ({
    username: state.user.username,
    assetList: state.assets.list,
    loading: state.loading
  }));

  useEffect(() => {
    dispatch(AssetActions.getAssets());
  }, []);

  const hasAssets = () => !loading && assetList.length > 0;

  const renderLoader = () => (loading ? <Loader /> : null);

  const renderEmptyTable = () => {
    if (!loading && assetList.length === 0) {
      return (
        <p className="asset-table__empty">{t('AssetList.NoUploadedAssets')}</p>
      );
    }
    return null;
  };

  return (
    <article className="asset-table-container">
      <Helmet>
        <title>{t('AssetList.Title')}</title>
      </Helmet>
      {renderLoader()}
      {renderEmptyTable()}
      {hasAssets() && (
        <table className="asset-table">
          <thead>
            <tr>
              <th>{t('AssetList.HeaderName')}</th>
              <th>{t('AssetList.HeaderSize')}</th>
              <th>{t('AssetList.HeaderSketch')}</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {assetList.map((asset) => (
              <AssetListRow asset={asset} key={asset.key} username={username} />
            ))}
          </tbody>
        </table>
      )}
    </article>
  );
};

export default AssetList;
