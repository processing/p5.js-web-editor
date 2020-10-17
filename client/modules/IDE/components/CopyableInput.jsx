import PropTypes from 'prop-types';
import React from 'react';
import Clipboard from 'clipboard';
import classNames from 'classnames';
import { withTranslation } from 'react-i18next';

import ShareIcon from '../../../images/share.svg';

class CopyableInput extends React.Component {
  constructor(props) {
    super(props);
    this.onMouseLeaveHandler = this.onMouseLeaveHandler.bind(this);
  }

  componentDidMount() {
    this.clipboard = new Clipboard(this.input, {
      target: () => this.input
    });

    this.clipboard.on('success', (e) => {
      this.tooltip.classList.add('tooltipped');
      this.tooltip.classList.add('tooltipped-n');
    });
  }

  componentWillUnmount() {
    this.clipboard.destroy();
  }

  onMouseLeaveHandler() {
    this.tooltip.classList.remove('tooltipped');
    this.tooltip.classList.remove('tooltipped-n');
  }

  render() {
    const {
      label,
      value,
      hasPreviewLink
    } = this.props;
    const copyableInputClass = classNames({
      'copyable-input': true,
      'copyable-input--with-preview': hasPreviewLink
    });
    return (
      <div className={copyableInputClass}>
        <div
          className="copyable-input__value-container tooltipped-no-delay"
          aria-label={this.props.t('CopyableInput.CopiedARIA')}
          ref={(element) => { this.tooltip = element; }}
          onMouseLeave={this.onMouseLeaveHandler}
        >
          <label className="copyable-input__label" htmlFor={`copyable-input__value-${label}`}>
            <div className="copyable-input__label-container">
              {label}
            </div>
            <input
              type="text"
              className="copyable-input__value"
              id={`copyable-input__value-${label}`}
              value={value}
              ref={(element) => { this.input = element; }}
              readOnly
            />
          </label>
        </div>
        {hasPreviewLink &&
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={value}
            className="copyable-input__preview"
            aria-label={this.props.t('CopyableInput.CopiedARIA', { label })}
          >
            <ShareIcon focusable="false" aria-hidden="true" />
          </a>
        }
      </div>
    );
  }
}

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
