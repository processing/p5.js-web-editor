import { omit } from 'lodash';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import TableBase from './TableBase';

const RenameInput = ({ text, onSubmit, onCancel }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [inputRef]);

  const [renameValue, setRenameValue] = useState(text);

  const handleNameChange = () => {
    const newName = renameValue.trim();
    if (newName.length === 0 || newName === text) {
      onCancel();
    } else {
      onSubmit(newName);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') {
      handleNameChange();
    } else if (e.key === 'Esc' || e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <input
      value={renameValue}
      onChange={(e) => setRenameValue(e.target.value)}
      onKeyDown={handleKey}
      onBlur={handleNameChange}
      // onClick={(e) => e.stopPropagation()}
      ref={inputRef}
    />
  );
};

RenameInput.propTypes = {
  text: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

/**
 * Extends TableBase, but renders each row based on the columns.
 * Can provide a `Dropdown` column which gets the `row` as a prop.
 */
function TableWithRename({
  Dropdown,
  dropdownProps,
  columns,
  handleRename,
  ...props
}) {
  const [editingRowId, setEditingRowId] = useState(null);

  console.log({ editingRowId });

  const renderRow = (item) => (
    <tr key={item.id} className="sketches-table__row">
      {columns.map((column, i) => {
        const value = item[column.field];
        const formatted = column.formatValue
          ? column.formatValue(value, item)
          : value;
        const content =
          column.field === 'name' && editingRowId === item.id ? (
            <RenameInput
              text={value}
              onSubmit={(newName) => {
                handleRename(newName, item.id);
                setEditingRowId(null);
              }}
              onCancel={() => {
                setEditingRowId(null);
              }}
            />
          ) : (
            formatted
          );
        if (i === 0) {
          return (
            <th scope="row" key={column.field}>
              {content}
            </th>
          );
        }
        return <td key={column.field}>{content}</td>;
      })}
      {
        // TODO: styled-component
        Dropdown && (
          <td className="sketch-list__dropdown-column">
            <Dropdown
              {...dropdownProps}
              row={item}
              onClickRename={() => {
                setTimeout(() => setEditingRowId(item.id), 0);
              }}
            />
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

TableWithRename.propTypes = {
  ...omit(TableBase.propTypes, ['renderRow', 'addDropdownColumn']),
  Dropdown: PropTypes.elementType.isRequired,
  handleRename: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  dropdownProps: PropTypes.object
};

TableWithRename.defaultProps = {
  dropdownProps: {}
};

export default TableWithRename;
