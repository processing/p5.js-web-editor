import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router';
import { Helmet } from 'react-helmet';
import prettyBytes from 'pretty-bytes';
import { withTranslation } from 'react-i18next';
import styled from 'styled-components';

import Loader from '../../App/components/loader';
import * as AssetActions from '../actions/assets';
import DownFilledTriangleIcon from '../../../images/down-filled-triangle.svg';
import { remSize } from '../../../theme';

const AssetTableRow = styled.tr`
  margin: ${remSize(10)};
  height: ${remSize(72)};
  font-size: ${remSize(16)};

  &:nth-child(odd) {
    background: ${({ theme }) => theme.tableRowStripeColor.default};
  }
  th {
    &:nth-child(1) {
      padding-left: ${remSize(12)};
    }
  }
  a {
    color: ${({ theme }) => theme.primaryTextColor};
  }
`;

const AssetTableDropdownColumn = styled.td`
  width: ${remSize(60)};
  position: relative;
`;

const assetTableDropdownButton = styled.button`
  width: ${remSize(25)};
  height: ${remSize(25)};
  & polygon,
  & path {
    fill: ${({ theme }) => theme.inactiveTextColor};
  }
`;

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
      <AssetTableRow key={asset.key}>
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
        <AssetTableDropdownColumn>
          <assetTableDropdownButton
            onClick={this.toggleOptions}
            onBlur={this.onBlurComponent}
            onFocus={this.onFocusComponent}
            aria-label={t('AssetList.ToggleOpenCloseARIA')}
          >
            <DownFilledTriangleIcon focusable="false" aria-hidden="true" />
          </assetTableDropdownButton>
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
                <Link
                  to={asset.url}
                  target="_blank"
                  onBlur={this.onBlurComponent}
                  onFocus={this.onFocusComponent}
                  className="asset-table__action-option"
                >
                  {t('AssetList.OpenNewTab')}
                </Link>
              </li>
            </ul>
          )}
        </AssetTableDropdownColumn>
      </AssetTableRow>
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
