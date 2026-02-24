import { apiClient } from '../../../utils/apiClient';
import * as ActionTypes from '../../../constants';
import { startLoader, stopLoader } from '../reducers/loading';
import { assetsActions } from '../reducers/assets';

const { setAssets, deleteAsset } = assetsActions;

export function getAssets() {
  return async (dispatch) => {
    dispatch(startLoader());
    try {
      const response = await apiClient.get('/S3/objects');

      const assetData = {
        assets: response.data.assets,
        totalSize: response.data.totalSize
      };

      dispatch(setAssets(assetData));
      dispatch(stopLoader());
    } catch (error) {
      dispatch({
        type: ActionTypes.ERROR
      });
      dispatch(stopLoader());
    }
  };
}

export function deleteAssetRequest(assetKey) {
  return async (dispatch) => {
    try {
      const path = assetKey.split('/').pop();
      await apiClient.delete(
        `/S3/delete?objectKey=${encodeURIComponent(path)}`
      );
      dispatch(deleteAsset(assetKey));
    } catch (error) {
      dispatch({
        type: ActionTypes.ERROR
      });
    }
  };
}
