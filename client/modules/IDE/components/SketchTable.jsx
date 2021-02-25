import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import Table from './Table';

// eslint-disable-next-line react/prefer-stateless-function
class SketchTable extends React.Component {
  render() {
    const SketchListHeaderRow = [
      { field: 'name', name: 'SketchList.HeaderName' },
      { field: 'createdAt', name: 'SketchList.HeaderCreatedAt' },
      { field: 'updatedAt', name: 'SketchList.HeaderUpdatedAt' }
    ];
    const { username, sketches, searchTerm } = this.props;
    return (
      <Table
        key={username}
        username={username}
        headerRow={SketchListHeaderRow}
        dataRows={sketches}
        listType="SketchList"
        searchTerm={searchTerm}
      />
    );
  }
}

function mapStateToProps(state) {
  return {
    sketches: state.sketches
  };
}

SketchTable.propTypes = {
  sketches: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
      updatedAt: PropTypes.string.isRequired
    })
  ).isRequired,
  username: PropTypes.string,
  searchTerm: PropTypes.string.isRequired
};

SketchTable.defaultProps = {
  username: undefined
};

export default withTranslation()(connect(mapStateToProps)(SketchTable));
