import * as ActionTypes from '../../../constants';

const assets = (state = [], action) => {
  switch (action.type) {
    case ActionTypes.SET_ASSETS:
      return action.assets;
    default:
      return state;
  }
};

export default assets;
