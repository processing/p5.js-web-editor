import * as ActionTypes from '../../../constants';

const sorting = (state = { orderBy: 'createdAt', order: 'Dsc' }, action) => {
  switch (action.type) {
    case ActionTypes.SET_SORT_PARAM:
      return { ...state, order: action.payload.order, orderBy: action.payload.orderBy };
    default:
      return state;
  }
};

export default sorting;
