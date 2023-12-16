import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '../../../common/Button';
import { DropdownArrowIcon } from '../../../common/icons';
import useModalClose from '../../../common/useModalClose';
import CopyableInput from '../../IDE/components/CopyableInput';
import { exportCollectionAsZip } from '../../IDE/actions/project';

const ShareURL = ({ value }) => {
  const [showURL, setShowURL] = useState(false);
  const { t } = useTranslation();
  const close = useCallback(() => setShowURL(false), [setShowURL]);
  const ref = useModalClose(close);
  function downloadCollection() {
    const urlArray = value.split('/');
    const collectionId = urlArray[urlArray.length - 1];
    exportCollectionAsZip(collectionId);
  }
  return (
    <div className="collection-share" ref={ref}>
      <Button
        onClick={() => setShowURL(!showURL)}
        iconAfter={<DropdownArrowIcon />}
      >
        {t('Collection.Share')}
      </Button>
      {showURL && (
        <div className="collection__share-dropdown">
          <CopyableInput value={value} label={t('Collection.URLLink')} />
          <Button onClick={downloadCollection}>
            {t('Collection.Download')}
          </Button>
        </div>
      )}
    </div>
  );
};

ShareURL.propTypes = {
  value: PropTypes.string.isRequired
};

export default ShareURL;
