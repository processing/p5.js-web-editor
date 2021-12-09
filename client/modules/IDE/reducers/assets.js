import * as ActionTypes from '../../../constants';

// 1,000,000 bytes in a MB. can't upload if totalSize is bigger than this.
const initialState = {
  list: [],
  totalSize: 0
};

const assets = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.SET_ASSETS:
      return { list: action.assets, totalSize: action.totalSize };
    case ActionTypes.DELETE_ASSET:
      return { list: state.list.filter((asset) => asset.key !== action.key) };
    default:
      return state;
  }
};

export default assets;
