import React, { PropTypes } from 'react';
import Clipboard from 'clipboard';

class CopyableInput extends React.Component {
  componentDidMount() {
    this.clipboard = new Clipboard(this.input, {
      target: () => this.input
    });
  }

  componentWillUnmount() {
    this.clipboard.destroy();
  }

  render() {
    const {
      label,
      value
    } = this.props;
    return (
      <div className="copyable-input">
        <label className="copyable-input__label" htmlFor="copyable-input__value">{label}</label>
        <div className="copyable-input__value-container">
          <input
            type="text"
            className="copyable-input__value"
            id="copyable-input__value"
            value={value}
            ref={(element) => { this.input = element; }}
          />
          <span
            className="copyable-input__tooltip tooltipped tooltipped-n"
            aria-label="Copyied to Clipboard!"
          >
          </span>
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
