import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '../../../common/Button';
import { DropdownArrowIcon } from '../../../common/icons';
import CopyableInput from '../../IDE/components/CopyableInput';

const ShareURL = ({ value }) => {
  const [showURL, setShowURL] = useState(false);
  const node = useRef();
  const { t } = useTranslation();

  const handleClickOutside = (e) => {
    if (node.current?.contains(e.target)) {
      return;
    }
    setShowURL(false);
  };

  useEffect(() => {
    if (showURL) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showURL]);

  return (
    <div className="collection-share" ref={node}>
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
