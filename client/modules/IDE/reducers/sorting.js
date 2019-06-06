import * as ActionTypes from '../../../constants';
import { DIRECTION } from '../actions/sorting';

const initialState = {
  field: 'createdAt',
  direction: DIRECTION.DESC
};

const sorting = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.TOGGLE_DIRECTION:
      if (action.field && action.field !== state.field) {
        if (action.field === 'name') {
          return { ...state, field: action.field, direction: DIRECTION.ASC };
        }
        return { ...state, field: action.field, direction: DIRECTION.DESC };
      }
      if (state.direction === DIRECTION.ASC) {
        return { ...state, direction: DIRECTION.DESC };
      }
      return { ...state, direction: DIRECTION.ASC };
    case ActionTypes.SET_SORTING:
      return { ...state, field: action.payload.field, direction: action.payload.direction };
    default:
      return state;
  }
};

export default sorting;
