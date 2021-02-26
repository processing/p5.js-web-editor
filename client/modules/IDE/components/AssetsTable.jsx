import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as AssetActions from '../actions/assets';
import Table from './Table';
import AssetListRow from './AssetList';

class AssetsTable extends React.Component {
  constructor(props) {
    super(props);
    this.props.getAssets();
  }
  render() {
    const AssetListRowHeader = [
      { field: 'name', name: 'AssetList.HeaderName' },
      { field: 'size', name: 'AssetList.HeaderSize' },
      { field: 'sketchName', name: 'AssetList.HeaderSketch' }
    ];
    const { username, assetList, searchTerm, mobile, user } = this.props;
    const assetTableRows = assetList.map((asset) => ({
      ...asset,
      row: (
        <AssetListRow
          mobile={mobile}
          key={asset.key}
          asset={asset}
          user={user}
          username={username}
        />
      )
    }));

    return (
      <Table
        key={username}
        username={username}
        headerRow={AssetListRowHeader}
        dataRows={assetTableRows}
        listType="AssetList"
        searchTerm={searchTerm}
      />
    );
  }
}

function mapStateToProps(state) {
  return {
    assetList: state.assets.list,
    state: state.user
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({}, AssetActions), dispatch);
}

AssetsTable.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string,
    authenticated: PropTypes.bool.isRequired
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
  username: PropTypes.string,
  searchTerm: PropTypes.string.isRequired,
  mobile: PropTypes.bool
};

AssetsTable.defaultProps = {
  username: undefined,
  mobile: false
};

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(AssetsTable)
);
