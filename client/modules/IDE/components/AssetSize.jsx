import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import prettyBytes from 'pretty-bytes';

import getConfig from '../../../utils/getConfig';

const limit = getConfig('UPLOAD_LIMIT') || 250000000;
const MAX_SIZE_B = limit;

const formatPercent = (percent) => {
  const percentUsed = percent * 100;
  if (percentUsed < 1) {
    return '0%';
  }

  return `${Math.round(percentUsed)}%`;
};

/* Eventually, this copy should be Total / 250 MB Used */
const AssetSize = ({ totalSize }) => {
  if (totalSize === undefined) {
    return null;
  }

  const currentSize = prettyBytes(totalSize);
  const sizeLimit = prettyBytes(MAX_SIZE_B);
  const percentValue = totalSize / MAX_SIZE_B;
  const percent = formatPercent(percentValue);
  const percentSize = percentValue < 1 ? percentValue : 1;

  return (
    <div className="asset-size">
      <div className="asset-size-bar" style={{ '--percent': percentSize }} />
      <p className="asset-current">
        {currentSize} ({percent})
      </p>
      <p className="asset-max">Max: {sizeLimit}</p>
    </div>
  );
};

AssetSize.propTypes = {
  totalSize: PropTypes.number.isRequired,
};

function mapStateToProps(state) {
  return {
    user: state.user,
    totalSize: state.user.totalSize || state.assets.totalSize,
  };
}

export default connect(mapStateToProps)(AssetSize);
