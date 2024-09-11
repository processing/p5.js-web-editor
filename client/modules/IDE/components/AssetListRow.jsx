import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import prettyBytes from 'pretty-bytes';
import MenuItem from '../../../components/Dropdown/MenuItem';
import TableDropdown from '../../../components/Dropdown/TableDropdown';
import { deleteAssetRequest } from '../actions/assets';

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

const AssetListRow = ({ asset, username }) => (
  <tr className="asset-table__row" key={asset.key}>
    <th scope="row">
      <a href={asset.url} target="_blank" rel="noopener noreferrer">
        {asset.name}
      </a>
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

AssetListRow.propTypes = {
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

export default AssetListRow;
