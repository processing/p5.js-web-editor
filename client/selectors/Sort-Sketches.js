import { createSelector } from 'reselect';

const sketchListSelector = state => state.sketches;
const orderSelector = state => state.sorting.order;
const orderBySelector = state => state.sorting.orderBy;

const orderListByDate = createSelector(
  sketchListSelector,
  orderSelector,
  orderBySelector,
  (sketchList, order, orderBy) => {
    const sortedList = sketchList.sort((a, b) => {
      const orderResult =
        order === 'Asc'
          ? new Date(a[orderBy]) - new Date(b[orderBy])
          : new Date(b[orderBy]) - new Date(a[orderBy]);
      return orderResult;
    });
    return sortedList;
  }
);

export default orderListByDate;
