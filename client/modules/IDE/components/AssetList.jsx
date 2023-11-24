import prettyBytes from 'pretty-bytes';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { connect, useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import TableBase from '../../../common/Table/TableBase';
import DownFilledTriangleIcon from '../../../images/down-filled-triangle.svg';
import { deleteAssetRequest, getAssets } from '../actions/assets';
import { DIRECTION } from '../actions/sorting';

class AssetListRowBase extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isFocused: false,
      optionsOpen: false
    };
  }

  onFocusComponent = () => {
    this.setState({ isFocused: true });
  };

  onBlurComponent = () => {
    this.setState({ isFocused: false });
    setTimeout(() => {
      if (!this.state.isFocused) {
        this.closeOptions();
      }
    }, 200);
  };

  openOptions = () => {
    this.setState({
      optionsOpen: true
    });
  };

  closeOptions = () => {
    this.setState({
      optionsOpen: false
    });
  };

  toggleOptions = () => {
    if (this.state.optionsOpen) {
      this.closeOptions();
    } else {
      this.openOptions();
    }
  };

  handleDropdownOpen = () => {
    this.closeOptions();
    this.openOptions();
  };

  handleAssetDelete = () => {
    const { key, name } = this.props.asset;
    this.closeOptions();
    if (window.confirm(this.props.t('Common.DeleteConfirmation', { name }))) {
      this.props.deleteAssetRequest(key);
    }
  };

  render() {
    const { asset, username, t } = this.props;
    const { optionsOpen } = this.state;
    return (
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
          <button
            className="asset-table__dropdown-button"
            onClick={this.toggleOptions}
            onBlur={this.onBlurComponent}
            onFocus={this.onFocusComponent}
            aria-label={t('AssetList.ToggleOpenCloseARIA')}
          >
            <DownFilledTriangleIcon focusable="false" aria-hidden="true" />
          </button>
          {optionsOpen && (
            <ul className="asset-table__action-dialogue">
              <li>
                <button
                  className="asset-table__action-option"
                  onClick={this.handleAssetDelete}
                  onBlur={this.onBlurComponent}
                  onFocus={this.onFocusComponent}
                >
                  {t('AssetList.Delete')}
                </button>
              </li>
              <li>
                <a
                  href={asset.url}
                  target="_blank"
                  rel="noreferrer"
                  onBlur={this.onBlurComponent}
                  onFocus={this.onFocusComponent}
                  className="asset-table__action-option"
                >
                  {t('AssetList.OpenNewTab')}
                </a>
              </li>
            </ul>
          )}
        </td>
      </tr>
    );
  }
}

AssetListRowBase.propTypes = {
  asset: PropTypes.shape({
    key: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    sketchId: PropTypes.string,
    sketchName: PropTypes.string,
    name: PropTypes.string.isRequired,
    size: PropTypes.number.isRequired
  }).isRequired,
  deleteAssetRequest: PropTypes.func.isRequired,
  username: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired
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
