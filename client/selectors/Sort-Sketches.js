import { createSelector } from 'reselect';
import differenceInMilliseconds from 'date-fns/difference_in_milliseconds';

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
          ? differenceInMilliseconds(new Date(a[orderBy]), new Date(b[orderBy]))
          : differenceInMilliseconds(new Date(b[orderBy]), new Date(a[orderBy]));
      return orderResult;
    });
    return sortedList;
  }
);

export default orderListByDate;
