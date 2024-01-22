import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '../../../common/Button';
import { DropdownArrowIcon } from '../../../common/icons';
import useModalClose from '../../../common/useModalClose';
import CopyableInput from '../../IDE/components/CopyableInput';

const ShareURL = ({ value }) => {
  const [showURL, setShowURL] = useState(false);
  const { t } = useTranslation();
  const close = useCallback(() => setShowURL(false), [setShowURL]);
  const ref = useModalClose(close);

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
        </div>
      )}
    </div>
  );
};

ShareURL.propTypes = {
  value: PropTypes.string.isRequired
};

export default ShareURL;
