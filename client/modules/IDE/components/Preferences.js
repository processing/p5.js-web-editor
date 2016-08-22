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

  handleLintSound(event) {
    this.props.setLintSound(event.target.value);
  }

  render() {
    const preferencesContainerClass = classNames({
      preferences: true,
      'preferences--selected': this.props.isVisible
    });
    let preferencesTabOptionClass = classNames({
      preference__option: true,
      'preference__option--selected': this.props.isTabIndent
    });
    let preferencesSpaceOptionClass = classNames({
      preference__option: true,
      'preference__option--selected': !this.props.isTabIndent
    });
    let autosaveOnClass = classNames({
      preference__option: true,
      'preference__option--selected': this.props.autosave
    });
    let autosaveOffClass = classNames({
      preference__option: true,
      'preference__option--selected': !this.props.autosave
    });
    let lintWarningOnClass = classNames({
      preference__option: true,
      'preference__option--selected': this.props.lintWarning
    });
    let lintWarningOffClass = classNames({
      preference__option: true,
      'preference__option--selected': !this.props.lintWarning
    });
    let textOutputOnClass = classNames({
      preference__option: true,
      'preference__option--selected': this.props.textOutput
    });
    let textOutputOffClass = classNames({
      preference__option: true,
      'preference__option--selected': !this.props.textOutput
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
            <button className={preferencesSpaceOptionClass} onClick={this.props.indentWithSpace} aria-label="indentation with space">Spaces</button>
            <button className={preferencesTabOptionClass} onClick={this.props.indentWithTab} aria-label="indentation with tab">Tabs</button>
          </div>
        </div>
        <div className="preference">
          <h4 className="preference__title">Autosave</h4>
          <div className="preference__options">
            <button
              className={autosaveOnClass}
              onClick={() => this.props.setAutosave(true)}
              aria-label="autosave on"
            >On</button>
            <button
              className={autosaveOffClass}
              onClick={() => this.props.setAutosave(false)}
              aria-label="autosave off"
            >Off</button>
          </div>
        </div>
        <div className="preference">
          <h4 className="preference__title">Lint Warning Sound</h4>
          <div className="preference__options">
            <button
              className={lintWarningOnClass}
              onClick={() => this.props.setLintWarning(true)}
              aria-label="lint warning on"
            >On</button>
            <button
              className={lintWarningOffClass}
              onClick={() => this.props.setLintWarning(false)}
              aria-label="lint warning off"
            >Off</button>
          </div>
        </div>
        <div className="preference">
          <h4 className="preference__title">{'Select Lint Warning Sound'}</h4>
          <div className="preference__options">
            <div>
              <input
                type="radio"
                id="beep1"
                name="beep1"
                value="beep1"
                checked={this.props.lintSound === 'beep1'}
                onChange={() => this.props.setLintSound('beep1')}
                aria-label="lint sound 1"
              />
              <label
                htmlFor="beep1"
              >Lint Sound 1</label>
            </div>
            <div>
              <input
                type="radio"
                id="beep2"
                name="beep2"
                value="beep2"
                checked={this.props.lintSound === 'beep2'}
                onChange={() => this.props.setLintSound('beep2')}
                aria-label="lint sound 2"
              />
              <label
                htmlFor="beep2"
              >Lint Sound 2</label>
            </div>
            <div>
              <input
                type="radio"
                id="beep3"
                name="beep3"
                value="beep3"
                checked={this.props.lintSound === 'beep3'}
                onChange={() => this.props.setLintSound('beep3')}
                aria-label="lint sound 3"
              />
              <label
                htmlFor="beep3"
              >Lint Sound 3</label>
            </div>
            <div>
              <input
                type="radio"
                id="beep4"
                name="beep4"
                value="beep4"
                checked={this.props.lintSound === 'beep4'}
                onChange={() => this.props.setLintSound('beep4')}
                aria-label="lint sound 4"
              />
              <label
                htmlFor="beep4"
              >Lint Sound 4</label>
            </div>
            <div>
              <input
                type="radio"
                id="beep5"
                name="beep5"
                value="beep5"
                checked={this.props.lintSound === 'beep5'}
                onChange={() => this.props.setLintSound('beep5')}
                aria-label="lint sound 5"
              />
              <label
                htmlFor="beep5"
              >Lint Sound 5</label>
            </div>
          </div>
        </div>
        <div className="preference">
          <h4 className="preference__title">Accessible Text-based Canvas</h4>
          <h6 className="preference__subtitle">Used with screen reader</h6>
          <div className="preference__options">
            <button
              className={textOutputOnClass}
              onClick={() => this.props.setTextOutput(true)}
              aria-label="text output on"
            >On</button>
            <button
              className={textOutputOffClass}
              onClick={() => this.props.setTextOutput(false)}
              aria-label="text output off"
            >Off</button>
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
  lintSound: PropTypes.string.isRequired,
  setLintWarning: PropTypes.func.isRequired,
  setLintSound: PropTypes.func.isRequired
};

export default Preferences;
