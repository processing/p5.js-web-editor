import classNames from 'classnames';
import { orderBy } from 'lodash';
import PropTypes from 'prop-types';
import React, { useState, useMemo } from 'react';
import Loader from '../../modules/App/components/loader';
import { DIRECTION } from '../../modules/IDE/actions/sorting';
import { TableEmpty } from './TableElements';
import TableHeaderCell, { StyledHeaderCell } from './TableHeaderCell';

const toAscDesc = (direction) => (direction === DIRECTION.ASC ? 'asc' : 'desc');

/**
 * Renders the headers, loading spinner, empty message.
 * Applies sorting to the items.
 * Expects a `renderRow` prop to render each row.
 */
function TableBase({
  initialSort,
  columns,
  items = [],
  isLoading,
  emptyMessage,
  caption,
  addDropdownColumn,
  renderRow,
  className
}) {
  const [sorting, setSorting] = useState(initialSort);

  const sortedItems = useMemo(
    () => orderBy(items, sorting.field, toAscDesc(sorting.direction)),
    [sorting.field, sorting.direction, items]
  );

  if (isLoading) {
    return <Loader />;
  }

  if (items.length === 0) {
    return <TableEmpty>{emptyMessage}</TableEmpty>;
  }

  return (
    <table
      className={classNames('sketches-table', className)}
      // TODO: summary is deprecated. Use a hidden <caption>.
      summary={caption}
    >
      <thead>
        <tr>
          {columns.map((column) => (
            <TableHeaderCell
              key={column.field}
              sorting={sorting}
              onSort={setSorting}
              field={column.field}
              defaultOrder={column.defaultOrder}
              title={column.title}
            />
          ))}
          {addDropdownColumn && <StyledHeaderCell scope="col" />}
        </tr>
      </thead>
      <tbody>{sortedItems.map((item) => renderRow(item, columns))}</tbody>
    </table>
  );
}

TableBase.propTypes = {
  initialSort: PropTypes.shape({
    field: PropTypes.string.isRequired,
    direction: PropTypes.string.isRequired
  }).isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      field: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      defaultOrder: PropTypes.oneOf([DIRECTION.ASC, DIRECTION.DESC]),
      formatValue: PropTypes.func
    })
  ).isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired
      // Will have other properties, depending on the type.
    })
  ),
  renderRow: PropTypes.func.isRequired,
  addDropdownColumn: PropTypes.bool,
  isLoading: PropTypes.bool,
  emptyMessage: PropTypes.string.isRequired,
  caption: PropTypes.string,
  className: PropTypes.string
};

TableBase.defaultProps = {
  items: [],
  isLoading: false,
  caption: '',
  addDropdownColumn: false,
  className: ''
};

export default TableBase;
