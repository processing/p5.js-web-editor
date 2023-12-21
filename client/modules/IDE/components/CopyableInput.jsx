import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';
import Clipboard from 'clipboard';
import classNames from 'classnames';
import { withTranslation } from 'react-i18next';

import ShareIcon from '../../../images/share.svg';

const CopyableInput = (props) => {
  const inputRef = useRef(null);
  const tooltipRef = useRef(null);
  const { label, value, hasPreviewLink } = props;
  const copyableInputClass = classNames({
    'copyable-input': true,
    'copyable-input--with-preview': hasPreviewLink
  });

  useEffect(() => {
    const clipboard = new Clipboard(inputRef.current, {
      target: () => inputRef.current
    });

    clipboard.on('success', (e) => {
      tooltipRef.current.classList.add('tooltipped');
      tooltipRef.current.classList.add('tooltipped-n');
    });
    return () => {
      clipboard.destroy();
    };
  }, []);

  function onMouseLeaveHandler() {
    tooltipRef.current.classList.remove('tooltipped');
    tooltipRef.current.classList.remove('tooltipped-n');
  }
  return (
    <div className={copyableInputClass}>
      <div
        className="copyable-input__value-container tooltipped-no-delay"
        aria-label={props.t('CopyableInput.CopiedARIA')}
        ref={tooltipRef}
        onMouseLeave={() => onMouseLeaveHandler()}
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
          aria-label={props.t('CopyableInput.CopiedARIA', { label })}
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
  hasPreviewLink: PropTypes.bool,
  t: PropTypes.func.isRequired
};

CopyableInput.defaultProps = {
  hasPreviewLink: false
};

export default withTranslation()(CopyableInput);
