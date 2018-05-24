import axios from 'axios';

import * as ActionTypes from '../../../constants';

const ROOT_URL = process.env.API_URL;

function setAssets(assets) {
  return {
    type: ActionTypes.SET_ASSETS,
    assets
  };
}

export function getAssets(username) {
  return (dispatch, getState) => {
    let url;
    if (username) {
      url = `${ROOT_URL}/S3/${username}/objects`;
    } else {
      url = `${ROOT_URL}/S3/objects`;
    }
    axios.get(url, { withCredentials: true })
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
