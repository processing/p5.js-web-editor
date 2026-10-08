import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import Clipboard from 'clipboard';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import ShareIcon from '../../../images/share.svg';

const CopyableInput = ({ label, value, hasPreviewLink }) => {
  const { t } = useTranslation();

  const [isCopied, setIsCopied] = useState(false);

  const inputRef = useRef(null);

  useEffect(() => {
    const input = inputRef.current;

    if (!input) return; // should never happen

    const clipboard = new Clipboard(input, {
      target: () => input
    });

    clipboard.on('success', () => {
      setIsCopied(true);
    });

    // eslint-disable-next-line consistent-return
    return () => {
      clipboard.destroy();
    };
  }, [inputRef, setIsCopied]);

  return (
    <div
      className={classNames(
        'copyable-input',
        hasPreviewLink && 'copyable-input--with-preview'
      )}
    >
      <div
        className={classNames(
          'copyable-input__value-container',
          'tooltipped-no-delay',
          isCopied && 'tooltipped tooltipped-n'
        )}
        aria-label={t('CopyableInput.CopiedARIA')}
        onMouseLeave={() => setIsCopied(false)}
      >
        <label
          className="copyable-input__label"
          htmlFor={`copyable-input__value-${label}`}
        >
          <div className="copyable-input__label-container">{label}</div>
          <input
            type="text"
            className="copyable-input__value"
            id={`copyable-input__value-${label}`}
            value={value}
            ref={inputRef}
            readOnly
          />
        </label>
      </div>
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
