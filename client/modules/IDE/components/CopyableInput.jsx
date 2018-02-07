import PropTypes from 'prop-types';
import React from 'react';
import Clipboard from 'clipboard';

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
      value
    } = this.props;
    return (
      <div className="copyable-input">
        <label className="copyable-input__label" htmlFor="copyable-input__value">{label}</label>
        <div
          className="copyable-input__value-container tooltipped-no-delay"
          aria-label="Copied to Clipboard!"
          ref={(element) => { this.tooltip = element; }}
          onMouseLeave={this.onMouseLeaveHandler}
        >
          <input
            type="text"
            className="copyable-input__value"
            id="copyable-input__value"
            value={value}
            ref={(element) => { this.input = element; }}
            readOnly
          />
        </div>
      </div>
    );
  }
}

CopyableInput.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired
};

export default CopyableInput;
