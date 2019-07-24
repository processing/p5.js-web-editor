import axios from 'axios';
import * as ActionTypes from '../../../constants';
import { startLoader, stopLoader } from './loader';

const __process = (typeof global !== 'undefined' ? global : window).process;
const ROOT_URL = __process.env.API_URL;

function setAssets(assets, totalSize) {
  return {
    type: ActionTypes.SET_ASSETS,
    assets,
    totalSize
  };
}

export function getAssets() {
  return (dispatch) => {
    dispatch(startLoader());
    axios.get(`${ROOT_URL}/S3/objects`, { withCredentials: true })
      .then((response) => {
        dispatch(setAssets(response.data.assets, response.data.totalSize));
        dispatch(stopLoader());
      })
      .catch(() => {
        dispatch({
          type: ActionTypes.ERROR
        });
        dispatch(stopLoader());
      });
  };
}

export function deleteAsset(assetKey, userId) {
  return {
    type: 'PLACEHOLDER'
  };
}
