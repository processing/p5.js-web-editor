import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import Table from './Table';

// eslint-disable-next-line react/prefer-stateless-function
class CollectionTable extends React.Component {
  render() {
    const CollectionListHeaderRow = [
      { field: 'name', name: 'CollectionList.HeaderName' },
      { field: 'createdAt', name: 'CollectionList.HeaderCreatedAt' },
      { field: 'updatedAt', name: 'CollectionList.HeaderUpdatedAt' },
      { field: 'numItems', name: 'CollectionList.HeaderNumItems' }
    ];
    const { username, collections, searchTerm } = this.props;
    return (
      <Table
        key={username}
        username={username}
        headerRow={CollectionListHeaderRow}
        dataRows={collections}
        listType="CollectionList"
        searchTerm={searchTerm}
      />
    );
  }
}

function mapStateToProps(state) {
  return {
    collections: state.collections
  };
}

CollectionTable.propTypes = {
  collections: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      createdAt: PropTypes.string.isRequired,
      updatedAt: PropTypes.string.isRequired
    })
  ).isRequired,
  username: PropTypes.string,
  searchTerm: PropTypes.string.isRequired
};

CollectionTable.defaultProps = {
  username: undefined
};

export default withTranslation()(connect(mapStateToProps)(CollectionTable));
