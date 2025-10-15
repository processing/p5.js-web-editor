import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import prettyBytes from 'pretty-bytes';
import { getConfig } from '../../../utils/getConfig';
import { parseNumber } from '../../../utils/parseStringToType';

const limit = parseNumber(getConfig('UPLOAD_LIMIT')) || 250000000;
const MAX_SIZE_B = limit;

const formatPercent = (percent) => {
  const percentUsed = percent * 100;
  if (percentUsed < 1) {
    return '0%';
  }

  return `${Math.round(percentUsed)}%`;
};

/* Eventually, this copy should be Total / 250 MB Used */
const AssetSize = () => {
  const { t } = useTranslation();

  const totalSize = useSelector(
    (state) => state.user.totalSize || state.assets.totalSize
  );

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
      <p className="asset-max">
        {t('AssetList.maximum')}: {sizeLimit}
      </p>
    </div>
  );
};

export default AssetSize;
