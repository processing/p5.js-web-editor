import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link, browserHistory } from 'react-router';
import InlineSVG from 'react-inlinesvg';
import * as AssetActions from '../actions/assets';

const trashCan = require('../../../images/trash-can.svg');

class AssetList extends React.Component {
  constructor(props) {
    super(props);
    this.props.getAssets(this.props.username);
  }

  render() {
    return (
      <div className="asset-table-container">
        <table className="asset-table">
          <thead>
            <tr>
              <th className="asset-list__delete-column" scope="col"></th>
              <th>Name</th>
              <th>View</th>
              <th>Sketch</th>
            </tr>
          </thead>
          <tbody>
            {this.props.assets.map(asset =>
              <tr className="asset-table__row" key={asset.key}>
                <td className="asset-table__delete">
                  <button
                    className="asset-list__delete-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Are you sure you want to delete ${asset.name}?`)) {
                        this.props.deleteAsset(asset.key, this.props.user.id);
                      }
                    }}
                  >
                    <InlineSVG src={trashCan} alt="Delete Asset" />
                  </button>
                </td>
                <td>{asset.name}</td>
                <td><Link to={asset.url} target="_blank">View</Link></td>
                <td><Link to={`/${this.props.user.username}/sketches/${asset.sketchId}`}>{asset.sketchName}</Link></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }
}

AssetList.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string,
    id: PropTypes.string
  }).isRequired,
  assets: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    sketchName: PropTypes.string.isRequired,
    sketchId: PropTypes.string.isRequired
  })).isRequired,
  getAssets: PropTypes.func.isRequired,
  deleteAsset: PropTypes.func.isRequired,
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
