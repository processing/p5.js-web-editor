import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import Table from './Table';

// eslint-disable-next-line react/prefer-stateless-function
class AssetsTable extends React.Component {
  render() {
    const AssetListRowHeader = [
      { field: 'name', name: 'AssetList.HeaderName' },
      { field: 'size', name: 'AssetList.HeaderSize' },
      { field: 'sketchName', name: 'AssetList.HeaderSketch' }
    ];
    const { username, assetList, searchTerm } = this.props;
    return (
      <Table
        key={username}
        username={username}
        headerRow={AssetListRowHeader}
        dataRows={assetList}
        listType="AssetList"
        searchTerm={searchTerm}
      />
    );
  }
}

function mapStateToProps(state) {
  return {
    assetList: state.assets.list
  };
}

AssetsTable.propTypes = {
  assetList: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      sketchName: PropTypes.string,
      sketchId: PropTypes.string
    })
  ).isRequired,
  username: PropTypes.string,
  searchTerm: PropTypes.string.isRequired
};

AssetsTable.defaultProps = {
  username: undefined
};

export default withTranslation()(connect(mapStateToProps)(AssetsTable));
