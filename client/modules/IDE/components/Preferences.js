import React, { PropTypes } from 'react';
import InlineSVG from 'react-inlinesvg';
import classNames from 'classnames';
// import { bindActionCreators } from 'redux';
// import { connect } from 'react-redux';
// import * as PreferencesActions from '../actions/preferences';

const exitUrl = require('../../../images/exit.svg');
const plusUrl = require('../../../images/plus.svg');
const minusUrl = require('../../../images/minus.svg');

class Preferences extends React.Component {
  constructor(props) {
    super(props);
    this.handleUpdateAutosave = this.handleUpdateAutosave.bind(this);
  }

  handleUpdateFont(event) {
    this.props.setFontSize(parseInt(event.target.value, 10));
  }

  handleUpdateIndentation(event) {
    this.props.setIndentation(parseInt(event.target.value, 10));
  }

  handleUpdateAutosave(event) {
    const value = event.target.value === 'true';
    this.props.setAutosave(value);
  }

  handleLintWarning(event) {
    const value = event.target.value === 'true';
    this.props.setLintWarning(value);
  }

  render() {
    const preferencesContainerClass = classNames({
      preferences: true,
      'preferences--selected': this.props.isVisible
    });

    return (
      <section className={preferencesContainerClass} tabIndex="0" title="preference-menu">
        <div className="preferences__heading">
          <h2 className="preferences__title">Preferences</h2>
          <button
            className="preferences__exit-button"
            onClick={this.props.closePreferences}
            title="exit"
            aria-label="exit preferences"
          >
            <InlineSVG src={exitUrl} alt="Exit Preferences" />
          </button>
        </div>

        <div className="preference">
          <h4 className="preference__title">Text Size</h4>
          <button
            className="preference__minus-button"
            onClick={() => this.props.setFontSize(this.props.fontSize - 2)}
            aria-label="decrease font size"
          >
            <InlineSVG src={minusUrl} alt="Decrease Font Size" />
            <h6 className="preference__label">Decrease</h6>
          </button>
          <input
            className="preference__value"
            aria-live="status"
            aria-live="polite"
            aria-atomic="true"
            role="status"
            value={this.props.fontSize}
            onChange={this.handleUpdateFont}
          >
          </input>
          <button
            className="preference__plus-button"
            onClick={() => this.props.setFontSize(this.props.fontSize + 2)}
            aria-label="increase font size"
          >
            <InlineSVG src={plusUrl} alt="Increase Font Size" />
            <h6 className="preference__label">Increase</h6>
          </button>
        </div>

        <div className="preference">
          <h4 className="preference__title">Indentation Amount</h4>
          <button
            className="preference__minus-button"
            onClick={() => this.props.setIndentation(this.props.indentationAmount - 2)}
            aria-label="decrease indentation amount"
          >
            <InlineSVG src={minusUrl} alt="DecreaseIndentation Amount" />
            <h6 className="preference__label">Decrease</h6>
          </button>
          <input
            className="preference__value"
            aria-live="status"
            aria-live="polite"
            aria-atomic="true"
            role="status"
            value={this.props.indentationAmount}
            onChange={this.handleUpdateIndentation}
          >
          </input>
          <button
            className="preference__plus-button"
            onClick={() => this.props.setIndentation(this.props.indentationAmount + 2)}
            aria-label="increase indentation amount"
          >
            <InlineSVG src={plusUrl} alt="IncreaseIndentation Amount" />
            <h6 className="preference__label">Increase</h6>
          </button>
          <div className="preference__vertical-list">
            <input
              type="radio"
              onChange={this.props.indentWithSpace}
              aria-label="indentation with space"
              name="indentation"
              id="indentation-space"
              className="preference__radio-button"
              value="Spaces"
              checked={!this.props.isTabIndent}
            />
            <label htmlFor="indentation-space" className="preference__option">Spaces</label>
            <input
              type="radio"
              onChange={this.props.indentWithTab}
              aria-label="indentation with tab"
              name="indentation"
              id="indentation-tab"
              className="preference__radio-button"
              value="Tabs"
              checked={this.props.isTabIndent}
            />
            <label htmlFor="indentation-tab" className="preference__option">Tabs</label>
          </div>
        </div>
        <div className="preference">
          <h4 className="preference__title">Autosave</h4>
          <div className="preference__options">
            <input
              type="radio"
              onChange={() => this.props.setAutosave(true)}
              aria-label="autosave on"
              name="autosave"
              id="autosave-on"
              className="preference__radio-button"
              value="On"
              checked={this.props.autosave}
            />
            <label htmlFor="autosave-on" className="preference__option">On</label>
            <input
              type="radio"
              onChange={() => this.props.setAutosave(false)}
              aria-label="autosave off"
              name="autosave"
              id="autosave-off"
              className="preference__radio-button"
              value="Off"
              checked={!this.props.autosave}
            />
            <label htmlFor="autosave-off" className="preference__option">Off</label>
          </div>
        </div>
        <div className="preference">
          <h4 className="preference__title">Lint Warning Sound</h4>
          <div className="preference__options">
            <input
              type="radio"
              onChange={() => this.props.setLintWarning(true)}
              aria-label="lint warning on"
              name="lint warning"
              id="lint-warning-on"
              className="preference__radio-button"
              value="On"
              checked={this.props.lintWarning}
            />
            <label htmlFor="lint-warning-on" className="preference__option">On</label>
            <input
              type="radio"
              onChange={() => this.props.setLintWarning(false)}
              aria-label="lint warning off"
              name="lint warning"
              id="lint-warning-off"
              className="preference__radio-button"
              value="Off"
              checked={!this.props.lintWarning}
            />
            <label htmlFor="lint-warning-off" className="preference__option">Off</label>
          </div>
        </div>
        <div className="preference">
          <h4 className="preference__title">Accessible Text-based Canvas</h4>
          <h6 className="preference__subtitle">Used with screen reader</h6>

          <div className="preference__options">
            <input
              type="radio"
              onChange={() => this.props.setTextOutput(true)}
              aria-label="text output on"
              name="text output"
              id="text-output-on"
              className="preference__radio-button"
              value="On"
              checked={this.props.textOutput}
            />
            <label htmlFor="text-output-on" className="preference__option">On</label>
            <input
              type="radio"
              onChange={() => this.props.setTextOutput(false)}
              aria-label="text output off"
              name="text output"
              id="text-output-off"
              className="preference__radio-button"
              value="Off"
              checked={!this.props.textOutput}
            />
            <label htmlFor="text-output-off" className="preference__option">Off</label>

          </div>
        </div>
      </section>
    );
  }
}

Preferences.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  closePreferences: PropTypes.func.isRequired,
  fontSize: PropTypes.number.isRequired,
  indentationAmount: PropTypes.number.isRequired,
  setIndentation: PropTypes.func.isRequired,
  indentWithSpace: PropTypes.func.isRequired,
  indentWithTab: PropTypes.func.isRequired,
  isTabIndent: PropTypes.bool.isRequired,
  setFontSize: PropTypes.func.isRequired,
  autosave: PropTypes.bool.isRequired,
  setAutosave: PropTypes.func.isRequired,
  textOutput: PropTypes.bool.isRequired,
  setTextOutput: PropTypes.func.isRequired,
  lintWarning: PropTypes.bool.isRequired,
  setLintWarning: PropTypes.func.isRequired
};

export default Preferences;
