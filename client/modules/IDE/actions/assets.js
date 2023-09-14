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
  return async (dispatch) => {
    dispatch(startLoader());
    try {
      const response = await apiClient.get('/S3/objects');
      dispatch(setAssets(response.data.assets, response.data.totalSize));
      dispatch(stopLoader());
    } catch (error) {
      dispatch({
        type: ActionTypes.ERROR
      });
      dispatch(stopLoader());
    }
  };
}

export function deleteAsset(assetKey) {
  return {
    type: ActionTypes.DELETE_ASSET,
    key: assetKey
  };
}

export function deleteAssetRequest(assetKey) {
  return async (dispatch) => {
    try {
      await apiClient.delete(`/S3/${assetKey}`);
      dispatch(deleteAsset(assetKey));
    } catch (error) {
      dispatch({
        type: ActionTypes.ERROR
      });
    }
  };
}
