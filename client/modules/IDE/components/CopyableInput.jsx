import PropTypes from 'prop-types';
import React from 'react';
import Clipboard from 'clipboard';
import InlineSVG from 'react-inlinesvg';
import classNames from 'classnames';

import shareUrl from '../../../images/share.svg';

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
          aria-label="Copied to Clipboard!"
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
          >
            <InlineSVG src={shareUrl} alt={`open ${label} view in new tab`} />
          </a>
        }
      </div>
    );
  }
}

CopyableInput.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  hasPreviewLink: PropTypes.bool
};

CopyableInput.defaultProps = {
  hasPreviewLink: false
};

export default CopyableInput;
