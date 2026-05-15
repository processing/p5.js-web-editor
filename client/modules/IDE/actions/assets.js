import { opApiClient } from '../../../utils/opApiClient';
import * as ActionTypes from '../../../constants';
import { startLoader, stopLoader } from '../reducers/loading';
import { assetsActions } from '../reducers/assets';
import { showToast } from './toast';

const { setAssets, deleteAsset } = assetsActions;

function encodeFilePath(filePath) {
  return filePath.split('/').map(encodeURIComponent).join('/');
}

function getTransactionErrorMessage(error, fallbackMessage) {
  const data = error?.response?.data;
  return (
    data?.message ||
    data?.error ||
    (typeof data === 'string' ? data : undefined) ||
    error?.message ||
    fallbackMessage
  );
}

function normalizeOpAsset(asset) {
  const visualID = asset.visualID == null ? null : String(asset.visualID);
  return {
    key: `${visualID ?? 'unknown'}:${asset.name}:${asset.url}`,
    name: asset.name,
    url: asset.url,
    size: asset.size,
    lastModified: asset.lastModified,
    visualID,
    sketchId: visualID,
    sketchName: asset.visualTitle
  };
}

export function getAssets() {
  return async (dispatch, getState) => {
    const { user } = getState();
    const userID = user?.id;

    // Wait until auth hydration (/whoami) provides the current user's ID.
    if (!userID) {
      return;
    }

    dispatch(startLoader());
    try {
      const response = await opApiClient.get(`/user/${userID}/files`);
      const assets = response.data.map(normalizeOpAsset);

      const assetData = {
        assets,
        totalSize: assets.reduce((total, asset) => total + asset.size, 0)
      };

      dispatch(setAssets(assetData));
      dispatch(stopLoader());
    } catch (error) {
      dispatch(
        showToast(
          getTransactionErrorMessage(error, 'Failed to load assets.'),
          5000
        )
      );
      dispatch({
        type: ActionTypes.ERROR
      });
      dispatch(stopLoader());
    }
  };
}

export function deleteAssetRequest(assetKey) {
  return async (dispatch, getState) => {
    try {
      const asset = getState().assets.list.find(
        (item) => item.key === assetKey
      );
      if (!asset?.visualID) {
        throw new Error('Only sketch files can be deleted.');
      }
      await opApiClient.delete(
        `/sketch/${asset.visualID}/files/${encodeFilePath(asset.name)}`
      );
      dispatch(deleteAsset(assetKey));
    } catch (error) {
      dispatch(
        showToast(
          getTransactionErrorMessage(error, 'Failed to delete asset.'),
          5000
        )
      );
      dispatch({
        type: ActionTypes.ERROR
      });
    }
  };
}
