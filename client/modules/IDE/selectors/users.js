import { createSelector } from 'reselect';

const getAuthenticated = state => state.user.authenticated;
const getTotalSize = state => state.user.totalSize;

export const getCanUploadMedia = createSelector(
  getAuthenticated,
  getTotalSize,
  (authenticated, totalSize) => {
    if (!authenticated) return false;
    // eventually do the same thing for verified when
    // email verification actually works
    if (totalSize > 250000000) return false;
    return true;
  }
);

export const getreachedTotalSizeLimit = createSelector(
  getTotalSize,
  (totalSize) => {
    // if (totalSize > 250000000) return true;
    if (totalSize > 1000) return true;
    return false;
  }
);
