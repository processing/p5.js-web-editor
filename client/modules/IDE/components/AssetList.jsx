import prettyBytes from 'pretty-bytes';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { connect, useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import TableBase from '../../../common/Table/TableBase';
import MenuItem from '../../../components/Dropdown/MenuItem';
import TableDropdown from '../../../components/Dropdown/TableDropdown';
import { deleteAssetRequest, getAssets } from '../actions/assets';
import { DIRECTION } from '../actions/sorting';

const AssetMenu = ({ item: asset }) => {
  const { t } = useTranslation();

  const dispatch = useDispatch();

  const handleAssetDelete = () => {
    const { key, name } = asset;
    if (window.confirm(t('Common.DeleteConfirmation', { name }))) {
      dispatch(deleteAssetRequest(key));
    }
  };

  return (
    <TableDropdown aria-label={t('AssetList.ToggleOpenCloseARIA')}>
      <MenuItem onClick={handleAssetDelete}>{t('AssetList.Delete')}</MenuItem>
      <MenuItem href={asset.url} target="_blank">
        {t('AssetList.OpenNewTab')}
      </MenuItem>
    </TableDropdown>
  );
};

AssetMenu.propTypes = {
  item: PropTypes.shape({
    key: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }).isRequired
};

const AssetListRowBase = ({ asset, username }) => (
  <tr className="asset-table__row" key={asset.key}>
    <th scope="row">
      <Link to={asset.url} target="_blank">
        {asset.name}
      </Link>
    </th>
    <td>{prettyBytes(asset.size)}</td>
    <td>
      {asset.sketchId && (
        <Link to={`/${username}/sketches/${asset.sketchId}`}>
          {asset.sketchName}
        </Link>
      )}
    </td>
    <td className="asset-table__dropdown-column">
      <AssetMenu item={asset} />
    </td>
  </tr>
);

AssetListRowBase.propTypes = {
  asset: PropTypes.shape({
    key: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    sketchId: PropTypes.string,
    sketchName: PropTypes.string,
    name: PropTypes.string.isRequired,
    size: PropTypes.number.isRequired
  }).isRequired,
  username: PropTypes.string.isRequired
};

function mapStateToPropsAssetListRow(state) {
  return {
    username: state.user.username
  };
}

const AssetListRow = connect(mapStateToPropsAssetListRow, {
  deleteAssetRequest
})(AssetListRowBase);

const AssetList = () => {
  const { t } = useTranslation();

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAssets());
  }, []);

  const isLoading = useSelector((state) => state.loading);

  const assetList = useSelector((state) => state.assets.list);

  const items = useMemo(
    // This is a hack to use the order from the API as the initial sort
    () => assetList?.map((asset, i) => ({ ...asset, index: i, id: asset.key })),
    [assetList]
  );

  return (
    <article className="asset-table-container">
      <Helmet>
        <title>{t('AssetList.Title')}</title>
      </Helmet>
      <TableBase
        className="asset-table"
        items={items}
        isLoading={isLoading}
        columns={[
          {
            field: 'name',
            title: t('AssetList.HeaderName'),
            defaultOrder: DIRECTION.ASC
          },
          {
            field: 'size',
            title: t('AssetList.HeaderSize'),
            defaultOrder: DIRECTION.DESC
          },
          {
            field: 'sketchName',
            title: t('AssetList.HeaderSketch'),
            defaultOrder: DIRECTION.ASC
          }
        ]}
        addDropdownColumn
        initialSort={{
          field: 'index',
          direction: DIRECTION.ASC
        }}
        emptyMessage={t('AssetList.NoUploadedAssets')}
        renderRow={(asset) => (
          <AssetListRow asset={asset} key={asset.key} t={t} />
        )}
      />
    </article>
  );
};

export default AssetList;
