import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import prettyBytes from 'pretty-bytes';

const MB_TO_B = 1000 * 1000;
const MAX_SIZE_B = 250 * MB_TO_B;

const formatPercent = (percent) => {
  const percentUsed = percent * 100;
  if (percentUsed < 1) {
    return '0%';
  }

  return `${Math.round(percentUsed)}%`;
};

/* Eventually, this copy should be Total / 250 MB Used */
const AssetSize = ({ totalSize }) => {
  if (!totalSize) {
    return null;
  }

  const currentSize = prettyBytes(totalSize);
  const sizeLimit = prettyBytes(MAX_SIZE_B);
  const percent = formatPercent(totalSize / MAX_SIZE_B);

  return (
    <div className="asset-size" style={{ '--percent': percent }}>
      <div className="asset-size-bar">
        <p className="asset-current">{currentSize} ({percent})</p>
        <p className="asset-max">Max: {sizeLimit}</p>
      </div>
    </div>
  );
};

AssetSize.propTypes = {
  totalSize: PropTypes.number.isRequired,
};

function mapStateToProps(state) {
  return {
    user: state.user,
    totalSize: state.assets.totalSize,
  };
}

export default connect(mapStateToProps)(AssetSize);
