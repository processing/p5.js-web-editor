import axios from 'axios';

import * as ActionTypes from '../../../constants';

const __process = (typeof global !== 'undefined' ? global : window).process;
const ROOT_URL = __process.env.API_URL;

function setAssets(assets) {
  return {
    type: ActionTypes.SET_ASSETS,
    assets
  };
}

export function getAssets() {
  return (dispatch, getState) => {
    axios.get(`${ROOT_URL}/S3/objects`, { withCredentials: true })
      .then((response) => {
        dispatch(setAssets(response.data.assets));
      })
      .catch(response => dispatch({
        type: ActionTypes.ERROR
      }));
  };
}

export function deleteAsset(assetKey, userId) {
  return {
    type: 'PLACEHOLDER'
  };
}
