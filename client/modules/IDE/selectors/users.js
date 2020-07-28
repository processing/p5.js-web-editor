import { createSelector } from 'reselect';
import getConfig from '../../../utils/getConfig';

const getAuthenticated = state => state.user.authenticated;
const getTotalSize = state => state.user.totalSize;
const getAssetsTotalSize = state => state.assets.totalSize;
const limit = getConfig('UPLOAD_LIMIT') || 250000000;

export const getCanUploadMedia = createSelector(
  getAuthenticated,
  getTotalSize,
  (authenticated, totalSize) => {
    if (!authenticated) return false;
    // eventually do the same thing for verified when
    // email verification actually works
    if (totalSize > limit) return false;
    return true;
  }
);

export const getreachedTotalSizeLimit = createSelector(
  getTotalSize,
  getAssetsTotalSize,
  (totalSize, assetsTotalSize) => {
    const currentSize = totalSize || assetsTotalSize;
    if (currentSize && currentSize > limit) return true;
    // if (totalSize > 1000) return true;
    return false;
  }
);
