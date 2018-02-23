import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router';
import { Helmet } from 'react-helmet';

import prettyBytes from 'pretty-bytes';

import * as AssetActions from '../actions/assets';


class AssetList extends React.Component {
  constructor(props) {
    super(props);
    this.props.getAssets(this.props.username);
  }

  getAssetsTitle() {
    if (this.props.username === this.props.user.username) {
      return 'p5.js Web Editor | My assets';
    }
    return `p5.js Web Editor | ${this.props.username}'s assets`;
  }

  render() {
    return (
      <div className="asset-table-container">
        <Helmet>
          <title>{this.getAssetsTitle()}</title>
        </Helmet>
        {this.props.assets.length === 0 &&
          <p className="asset-table__empty">No uploaded assets.</p>
        }
        {this.props.assets.length > 0 &&
          <table className="asset-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Size</th>
                <th>View</th>
                <th>Sketch</th>
              </tr>
            </thead>
            <tbody>
              {this.props.assets.map(asset =>
                <tr className="asset-table__row" key={asset.key}>
                  <td>{asset.name}</td>
                  <td>{prettyBytes(asset.size)}</td>
                  <td><Link to={asset.url} target="_blank">View</Link></td>
                  <td><Link to={`/${this.props.username}/sketches/${asset.sketchId}`}>{asset.sketchName}</Link></td>
                </tr>
              )}
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
  assets: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    sketchName: PropTypes.string.isRequired,
    sketchId: PropTypes.string.isRequired
  })).isRequired,
  getAssets: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    user: state.user,
    assets: state.assets
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({}, AssetActions), dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(AssetList);
