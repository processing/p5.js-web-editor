import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router';
import { Helmet } from 'react-helmet';
import prettyBytes from 'pretty-bytes';
import InlineSVG from 'react-inlinesvg';

import Loader from '../../App/components/loader';
import * as AssetActions from '../actions/assets';
import downFilledTriangle from '../../../images/down-filled-triangle.svg';

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
  }

  onBlurComponent = () => {
    this.setState({ isFocused: false });
    setTimeout(() => {
      if (!this.state.isFocused) {
        this.closeOptions();
      }
    }, 200);
  }

  openOptions = () => {
    this.setState({
      optionsOpen: true
    });
  }

  closeOptions = () => {
    this.setState({
      optionsOpen: false
    });
  }

  toggleOptions = () => {
    if (this.state.optionsOpen) {
      this.closeOptions();
    } else {
      this.openOptions();
    }
  }

  handleDropdownOpen = () => {
    this.closeOptions();
    this.openOptions();
  }

  handleAssetDelete = () => {
    const { key, name } = this.props.asset;
    this.closeOptions();
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      this.props.deleteAssetRequest(key);
    }
  }

  render() {
    const { asset, username } = this.props;
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
          { asset.sketchId && <Link to={`/${username}/sketches/${asset.sketchId}`}>{asset.sketchName}</Link> }
        </td>
        <td className="asset-table__dropdown-column">
          <button
            className="asset-table__dropdown-button"
            onClick={this.toggleOptions}
            onBlur={this.onBlurComponent}
            onFocus={this.onFocusComponent}
          >
            <InlineSVG src={downFilledTriangle} alt="Menu" />
          </button>
          {optionsOpen &&
            <ul
              className="asset-table__action-dialogue"
            >
              <li>
                <button
                  className="asset-table__action-option"
                  onClick={this.handleAssetDelete}
                  onBlur={this.onBlurComponent}
                  onFocus={this.onFocusComponent}
                >
                  Delete
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
                  Open in New Tab
                </Link>
              </li>
            </ul>}
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

const AssetListRow = connect(mapStateToPropsAssetListRow, mapDispatchToPropsAssetListRow)(AssetListRowBase);

class AssetList extends React.Component {
  constructor(props) {
    super(props);
    this.props.getAssets();
  }

  getAssetsTitle() {
    return 'p5.js Web Editor | My assets';
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
      return (<p className="asset-table__empty">No uploaded assets.</p>);
    }
    return null;
  }

  render() {
    const { assetList } = this.props;
    return (
      <div className="asset-table-container">
        <Helmet>
          <title>{this.getAssetsTitle()}</title>
        </Helmet>
        {this.renderLoader()}
        {this.renderEmptyTable()}
        {this.hasAssets() &&
          <table className="asset-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Size</th>
                <th>Sketch</th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              {assetList.map(asset => <AssetListRow asset={asset} key={asset.key} />)}
            </tbody>
          </table>}
      </div>
    );
  }
}

AssetList.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string
  }).isRequired,
  assetList: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    sketchName: PropTypes.string,
    sketchId: PropTypes.string
  })).isRequired,
  getAssets: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired
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

export default connect(mapStateToProps, mapDispatchToProps)(AssetList);
