import { createSelector } from 'reselect';

const createdAtListSelector = state => state.sketches;

const orderListByDate = createSelector(
  createdAtListSelector,
  createdAtList => createdAtList.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
);

export default orderListByDate;
