import apiClient from '../../../utils/apiClient';
import * as ActionTypes from '../../../constants';
import { startLoader, stopLoader } from './loader';
import { assetsActions } from '../reducers/assets';

const { setAssets, deleteAsset } = assetsActions;

export function getAssets() {
  return (dispatch) => {
    dispatch(startLoader());
    apiClient
      .get('/S3/objects')
      .then((response) => {
        dispatch(
          setAssets({
            list: response.data.assets,
            totalSize: response.data.totalSize
          })
        );
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

export function deleteAssetRequest(assetKey) {
  return (dispatch) => {
    apiClient
      .delete(`/S3/${assetKey}`)
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
