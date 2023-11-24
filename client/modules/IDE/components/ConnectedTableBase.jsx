import { omit } from 'lodash';
import React, { useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import TableBase from '../../../common/Table/TableBase';
import { DIRECTION, setSorting } from '../actions/sorting';

/**
 * Connects the `TableBase` UI component with Redux.
 * Resets the sorting state on mount based on the `initialSort` prop.
 * Changes the sorting state when clicking on headers.
 */
const ConnectedTableBase = ({ initialSort, ...props }) => {
  const sorting = useSelector((state) => state.sorting);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setSorting(initialSort.field, initialSort.direction));
  }, [initialSort.field, initialSort.direction, dispatch]);

  const handleSort = useCallback(
    (sort) => {
      dispatch(setSorting(sort.field, sort.direction));
    },
    [dispatch]
  );

  return <TableBase {...props} onChangeSort={handleSort} sortBy={sorting} />;
};

ConnectedTableBase.propTypes = {
  ...omit(TableBase.propTypes, 'sortBy', 'onChangeSort'),
  initialSort: TableBase.propTypes.sortBy
};

ConnectedTableBase.defaultProps = {
  initialSort: {
    field: 'createdAt',
    direction: DIRECTION.DESC
  }
};

export default ConnectedTableBase;
