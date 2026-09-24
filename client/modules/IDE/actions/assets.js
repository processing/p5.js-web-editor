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

export function deleteAssetRequest(asset) {
  return async (dispatch, getState) => {
    try {
      if (asset.sketchId) {
        await apiClient.delete(
          `/projects/${asset.sketchId}/files/${asset.fileId}`,
          { params: { parentId: asset.parentId } }
        );

        const { project } = getState();
        if (project.id === asset.sketchId) {
          dispatch({
            type: ActionTypes.DELETE_FILE,
            id: asset.fileId,
            parentId: asset.parentId
          });
        }
      } else {
        await apiClient.delete('/S3/delete', {
          params: { objectKey: asset.key }
        });
      }
      dispatch(deleteAsset(asset.key));
    } catch (error) {
      dispatch({
        type: ActionTypes.ERROR
      });
    }
  };
}
