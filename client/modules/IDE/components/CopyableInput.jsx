import PropTypes from 'prop-types';
import React, { useRef } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import CopyableTooltip from '../../../components/CopyableTooltip';

import ShareIcon from '../../../images/share.svg';

const CopyableInput = ({ label, value, hasPreviewLink }) => {
  const { t } = useTranslation();
  const inputRef = useRef(null);

  const handleInputFocus = () => {
    if (!inputRef?.current) return;
    inputRef.current.select();
  };

  return (
    <div
      className={classNames(
        'copyable-input',
        hasPreviewLink && 'copyable-input--with-preview'
      )}
    >
      <CopyableTooltip
        className="copyable-input__value-container"
        label={t('CopyableInput.CopiedARIA')}
        copyText={value}
      >
        <label
          className="copyable-input__label"
          htmlFor={`copyable-input__value-${label}`}
        >
          <div className="copyable-input__label-container">{label}</div>
          <input
            type="text"
            className={classNames('copy-trigger', 'copyable-input__value')}
            id={`copyable-input__value-${label}`}
            value={value}
            ref={inputRef}
            onFocus={handleInputFocus}
            readOnly
          />
        </label>
      </CopyableTooltip>

      {hasPreviewLink && (
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={value}
          className="copyable-input__preview"
          aria-label={t('CopyableInput.CopiedARIA', { label })}
        >
          <ShareIcon focusable="false" aria-hidden="true" />
        </a>
      )}
    </div>
  );
};

CopyableInput.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  hasPreviewLink: PropTypes.bool
};

CopyableInput.defaultProps = {
  hasPreviewLink: false
};

export default CopyableInput;
