import apiClient from '../../../utils/apiClient';
import * as ActionTypes from '../../../constants';
import { startLoader, stopLoader } from './loader';

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
    apiClient.get('/S3/objects')
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

export function deleteAsset(assetKey) {
  return {
    type: ActionTypes.DELETE_ASSET,
    key: assetKey
  };
}

export function deleteAssetRequest(assetKey) {
  return (dispatch) => {
    apiClient.delete(`/S3/${assetKey}`)
      .then((response) => {
        dispatch(deleteAsset(assetKey));
      })
      .catch(() => {
        dispatch({
          type: ActionTypes.ERROR
        });
      });
  };
}
