import PropTypes from 'prop-types';
import React from 'react';
import { connect, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import prettyBytes from 'pretty-bytes';
import { useTranslation, withTranslation } from 'react-i18next';
import MenuItem from '../../../components/Dropdown/MenuItem';
import TableDropdown from '../../../components/Dropdown/TableDropdown';

import Loader from '../../App/components/loader';
import { deleteAssetRequest } from '../actions/assets';
import * as AssetActions from '../actions/assets';

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

function mapDispatchToPropsAssetListRow(dispatch) {
  return bindActionCreators(AssetActions, dispatch);
}

const AssetListRow = connect(
  mapStateToPropsAssetListRow,
  mapDispatchToPropsAssetListRow
)(AssetListRowBase);

class AssetList extends React.Component {
  constructor(props) {
    super(props);
    this.props.getAssets();
  }

  getAssetsTitle() {
    return this.props.t('AssetList.Title');
  }

  hasAssets() {
    return !this.props.loading && this.props.assetList.length > 0;
  }

  renderLoader() {
    if (this.props.loading) return <Loader />;
    return null;
  }

  renderEmptyTable() {
    if (!this.props.loading && this.props.assetList.length === 0) {
      return (
        <p className="asset-table__empty">
          {this.props.t('AssetList.NoUploadedAssets')}
        </p>
      );
    }
    return null;
  }

  render() {
    const { assetList, t } = this.props;
    return (
      <article className="asset-table-container">
        <Helmet>
          <title>{this.getAssetsTitle()}</title>
        </Helmet>
        {this.renderLoader()}
        {this.renderEmptyTable()}
        {this.hasAssets() && (
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
                <AssetListRow asset={asset} key={asset.key} t={t} />
              ))}
            </tbody>
          </table>
        )}
      </article>
    );
  }
}

AssetList.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string
  }).isRequired,
  assetList: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      sketchName: PropTypes.string,
      sketchId: PropTypes.string
    })
  ).isRequired,
  getAssets: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired
};

function mapStateToProps(state) {
  return {
    user: state.user,
    assetList: state.assets.list,
    loading: state.loading
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({}, AssetActions), dispatch);
}

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(AssetList)
);
