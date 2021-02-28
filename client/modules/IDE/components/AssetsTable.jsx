import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as AssetActions from '../actions/assets';
import Table from './Table';
import AssetListRow from './AssetListRow';

class AssetsTable extends React.Component {
  constructor(props) {
    super(props);
    this.props.getAssets();
  }
  render() {
    const { username, assetList, searchTerm, mobile, user } = this.props;

    const AssetListRowHeader = [
      { field: 'name', name: this.props.t('AssetList.HeaderName') },
      { field: 'size', name: this.props.t('AssetList.HeaderSize') },
      { field: 'sketchName', name: this.props.t('AssetList.HeaderSketch') }
    ];

    const extras = {
      emptyTableText: this.props.t('AssetList.NoUploadedAssets'),
      title: this.props.t('AssetList.Title'),
      summary: this.props.t('AssetList.TableSummary'),
      buttonAscAriaLable: 'AssetList.ButtonLabelAscendingARIA',
      buttonDescAriaLable: 'AssetList.ButtonLabelDescendingARIA',
      arrowUpIconAriaLable: 'AssetList.DirectionAscendingARIA',
      arrowDownIconAriaLable: 'AssetList.DirectionDescendingARIA'
    };

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
        searchTerm={searchTerm}
        extras={extras}
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
  mobile: PropTypes.bool,
  t: PropTypes.func.isRequired
};

AssetsTable.defaultProps = {
  username: undefined,
  mobile: false
};

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(AssetsTable)
);
