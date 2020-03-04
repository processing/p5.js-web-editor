import { createSelector } from 'reselect';

const __process = (typeof global !== 'undefined' ? global : window).process;
const getAuthenticated = state => state.user.authenticated;
const getTotalSize = state => state.user.totalSize;
const limit = __process.env.UPLOAD_LIMIT || 250000000;

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
  (totalSize) => {
    if (totalSize > limit) return true;
    // if (totalSize > 1000) return true;
    return false;
  }
);
