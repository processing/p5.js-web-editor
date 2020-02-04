import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router';
import { Helmet } from 'react-helmet';
import prettyBytes from 'pretty-bytes';

import Loader from '../../App/components/loader';
import * as AssetActions from '../actions/assets';

class AssetList extends React.Component {
  constructor(props) {
    super(props);
    this.props.getAssets();
  }

  getAssetsTitle() {
    if (!this.props.username || this.props.username === this.props.user.username) {
      return 'p5.js Web Editor | My assets';
    }
    return `p5.js Web Editor | ${this.props.username}'s assets`;
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
    const username = this.props.username !== undefined ? this.props.username : this.props.user.username;
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
                <th scope="col">Name</th>
                <th scope="col">Size</th>
                <th scope="col">Sketch</th>
              </tr>
            </thead>
            <tbody>
              {assetList.map(asset =>
                (
                  <tr className="asset-table__row" key={asset.key}>
                    <th scope="row">
                      <Link to={asset.url} target="_blank">
                        {asset.name}
                      </Link>
                    </th>
                    <td>{prettyBytes(asset.size)}</td>
                    <td><Link to={`/${username}/sketches/${asset.sketchId}`}>{asset.sketchName}</Link></td>
                  </tr>
                ))}
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
  username: PropTypes.string.isRequired,
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
    totalSize: state.assets.totalSize,
    loading: state.loading
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({}, AssetActions), dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(AssetList);
