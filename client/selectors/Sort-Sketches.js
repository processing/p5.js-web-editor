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
      console.log('running');
      const orderResult =
        order === 'Asc'
          ? new Date(a[orderBy]) - new Date(b[orderBy])
          : new Date(b[orderBy]) - new Date(a[orderBy]);
      console.log(orderResult);
      return orderResult;
    });
    console.log(sortedList);
    return sortedList;
  }
);

export default orderListByDate;
