import { omit } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import TableBase from './TableBase';

/**
 * Extends TableBase, but renders each row based on the columns.
 * Can provide a `Dropdown` column which gets the `row` as a prop.
 */
function StandardTable({ Dropdown, columns, ...props }) {
  const renderRow = (item) => (
    <tr key={item.id}>
      {columns.map((column, i) => {
        const value = item[column.field];
        const formatted = column.formatValue
          ? column.formatValue(value)
          : value;
        if (i === 0) {
          return (
            <th scope="row" key={column.field}>
              {formatted}
            </th>
          );
        }
        return <td key={column.field}>{formatted}</td>;
      })}
      {
        // TODO: styled-component
        Dropdown && (
          <td className="sketch-list__dropdown-column">
            <Dropdown row={item} />
          </td>
        )
      }
    </tr>
  );
  return (
    <TableBase
      {...props}
      columns={columns}
      renderRow={renderRow}
      addDropdownColumn={Boolean(Dropdown)}
    />
  );
}

StandardTable.propTypes = {
  ...omit(TableBase.propTypes, ['renderRow', 'addDropdownColumn']),
  Dropdown: PropTypes.elementType
};

StandardTable.defaultProps = {
  Dropdown: null
};

export default StandardTable;
