import PropTypes from 'prop-types';
import React from 'react';
import InlineSVG from 'react-inlinesvg';
import { Helmet } from 'react-helmet';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
// import { bindActionCreators } from 'redux';
// import { connect } from 'react-redux';
// import * as PreferencesActions from '../actions/preferences';

const plusUrl = require('../../../images/plus.svg');
const minusUrl = require('../../../images/minus.svg');
const beepUrl = require('../../../sounds/audioAlert.mp3');

class Preferences extends React.Component {
  constructor(props) {
    super(props);
    this.handleUpdateAutosave = this.handleUpdateAutosave.bind(this);
    this.handleUpdateLinewrap = this.handleUpdateLinewrap.bind(this);
    this.handleLintWarning = this.handleLintWarning.bind(this);
    this.handleLineNumbers = this.handleLineNumbers.bind(this);
    this.onFontInputChange = this.onFontInputChange.bind(this);
    this.onFontInputSubmit = this.onFontInputSubmit.bind(this);
    this.increaseFontSize = this.increaseFontSize.bind(this);
    this.decreaseFontSize = this.decreaseFontSize.bind(this);
    this.setFontSize = this.setFontSize.bind(this);

    this.state = {
      fontSize: props.fontSize
    };
  }

  onFontInputChange(event) {
    const INTEGER_REGEX = /^[0-9\b]+$/;
    if (event.target.value === '' || INTEGER_REGEX.test(event.target.value)) {
      this.setState({
        fontSize: event.target.value
      });
    }
  }

  onFontInputSubmit(event) {
    event.preventDefault();
    let value = parseInt(this.state.fontSize, 10);
    if (Number.isNaN(value)) {
      value = 16;
    }
    if (value > 36) {
      value = 36;
    }
    if (value < 8) {
      value = 8;
    }
    this.setFontSize(value);
  }

  setFontSize(value) {
    this.setState({ fontSize: value });
    this.props.setFontSize(value);
  }

  decreaseFontSize() {
    const newValue = this.state.fontSize - 2;
    this.setFontSize(newValue);
  }

  increaseFontSize() {
    const newValue = this.state.fontSize + 2;
    this.setFontSize(newValue);
  }

  handleUpdateAutosave(event) {
    const value = event.target.value === 'true';
    this.props.setAutosave(value);
  }

  handleUpdateLinewrap(event) {
    const value = event.target.value === 'true';
    this.props.setLinewrap(value);
  }

  handleLintWarning(event) {
    const value = event.target.value === 'true';
    this.props.setLintWarning(value);
  }

  handleLineNumbers(event) {
    const value = event.target.value === 'true';
    this.props.setLineNumbers(value);
  }

  render() {
    const beep = new Audio(beepUrl);

    return (
      <section className="preferences">
        <Helmet>
          <title>p5.js Web Editor | Preferences</title>
        </Helmet>
        <Tabs>
          <TabList>
            <div className="preference__subheadings">
              <Tab><h4 className="preference__subheading">General Settings</h4></Tab>
              <Tab><h4 className="preference__subheading">Accessibility</h4></Tab>
            </div>
          </TabList>
          <TabPanel>
            <div className="preference">
              <h4 className="preference__title">Theme</h4>
              <div className="preference__options">
                <input
                  type="radio"
                  onChange={() => this.props.setTheme('light')}
                  aria-label="light theme on"
                  name="light theme"
                  id="light-theme-on"
                  className="preference__radio-button"
                  value="light"
                  checked={this.props.theme === 'light'}
                />
                <label htmlFor="light-theme-on" className="preference__option">Light</label>
                <input
                  type="radio"
                  onChange={() => this.props.setTheme('dark')}
                  aria-label="dark theme on"
                  name="dark theme"
                  id="dark-theme-on"
                  className="preference__radio-button"
                  value="dark"
                  checked={this.props.theme === 'dark'}
                />
                <label htmlFor="dark-theme-on" className="preference__option">Dark</label>
                <input
                  type="radio"
                  onChange={() => this.props.setTheme('contrast')}
                  aria-label="high contrast theme on"
                  name="high contrast theme"
                  id="high-contrast-theme-on"
                  className="preference__radio-button"
                  value="contrast"
                  checked={this.props.theme === 'contrast'}
                />
                <label htmlFor="high-contrast-theme-on" className="preference__option">High Contrast</label>
              </div>
            </div>
            <div className="preference">
              <h4 className="preference__title">Text size</h4>
              <button
                className="preference__minus-button"
                onClick={this.decreaseFontSize}
                aria-label="decrease font size"
                disabled={this.state.fontSize <= 8}
              >
                <InlineSVG src={minusUrl} alt="Decrease Font Size" title="Decrease Font Size" />
                <h6 className="preference__label">Decrease</h6>
              </button>
              <form onSubmit={this.onFontInputSubmit}>
                <input
                  className="preference__value"
                  aria-live="polite"
                  aria-atomic="true"
                  value={this.state.fontSize}
                  onChange={this.onFontInputChange}
                  type="text"
                  ref={(element) => { this.fontSizeInput = element; }}
                  onClick={() => { this.fontSizeInput.select(); }}
                />
              </form>
              <button
                className="preference__plus-button"
                onClick={this.increaseFontSize}
                aria-label="increase font size"
                disabled={this.state.fontSize >= 36}
              >
                <InlineSVG src={plusUrl} alt="Increase Font Size" title="Increase Font Size" />
                <h6 className="preference__label">Increase</h6>
              </button>
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
              <h4 className="preference__title">Word Wrap</h4>
              <div className="preference__options">
                <input
                  type="radio"
                  onChange={() => this.props.setLinewrap(true)}
                  aria-label="linewrap on"
                  name="linewrap"
                  id="linewrap-on"
                  className="preference__radio-button"
                  value="On"
                  checked={this.props.linewrap}
                />
                <label htmlFor="linewrap-on" className="preference__option">On</label>
                <input
                  type="radio"
                  onChange={() => this.props.setLinewrap(false)}
                  aria-label="linewrap off"
                  name="linewrap"
                  id="linewrap-off"
                  className="preference__radio-button"
                  value="Off"
                  checked={!this.props.linewrap}
                />
                <label htmlFor="linewrap-off" className="preference__option">Off</label>
              </div>
            </div>
          </TabPanel>
          <TabPanel>
            <div className="preference">
              <h4 className="preference__title">Line numbers</h4>
              <div className="preference__options">
                <input
                  type="radio"
                  onChange={() => this.props.setLineNumbers(true)}
                  aria-label="line numbers on"
                  name="line numbers"
                  id="line-numbers-on"
                  className="preference__radio-button"
                  value="On"
                  checked={this.props.lineNumbers}
                />
                <label htmlFor="line-numbers-on" className="preference__option">On</label>
                <input
                  type="radio"
                  onChange={() => this.props.setLineNumbers(false)}
                  aria-label="line numbers off"
                  name="line numbers"
                  id="line-numbers-off"
                  className="preference__radio-button"
                  value="Off"
                  checked={!this.props.lineNumbers}
                />
                <label htmlFor="line-numbers-off" className="preference__option">Off</label>
              </div>
            </div>
            <div className="preference">
              <h4 className="preference__title">Lint warning sound</h4>
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
                <button
                  className="preference__preview-button"
                  onClick={() => beep.play()}
                  aria-label="preview sound"
                >
                  Preview sound
                </button>
              </div>
            </div>
            <div className="preference">
              <h4 className="preference__title">Accessible text-based canvas</h4>
              <h6 className="preference__subtitle">Used with screen reader</h6>

              <div className="preference__options">
                <input
                  type="checkbox"
                  onChange={(event) => {
                    this.props.setTextOutput(event.target.checked);
                  }}
                  aria-label="text output on"
                  name="text output"
                  id="text-output-on"
                  value="On"
                  checked={(this.props.textOutput)}
                />
                <label htmlFor="text-output-on" className="preference__option preference__canvas">Plain-text</label>
                <input
                  type="checkbox"
                  onChange={(event) => {
                    this.props.setGridOutput(event.target.checked);
                  }}
                  aria-label="table output on"
                  name="table output"
                  id="table-output-on"
                  value="On"
                  checked={(this.props.gridOutput)}
                />
                <label htmlFor="table-output-on" className="preference__option preference__canvas">Table-text</label>
                <input
                  type="checkbox"
                  onChange={(event) => {
                    this.props.setSoundOutput(event.target.checked);
                  }}
                  aria-label="sound output on"
                  name="sound output"
                  id="sound-output-on"
                  value="On"
                  checked={(this.props.soundOutput)}
                />
                <label htmlFor="sound-output-on" className="preference__option preference__canvas">Sound</label>
              </div>
            </div>
          </TabPanel>
        </Tabs>
      </section>
    );
  }
}

Preferences.propTypes = {
  fontSize: PropTypes.number.isRequired,
  lineNumbers: PropTypes.bool.isRequired,
  setFontSize: PropTypes.func.isRequired,
  autosave: PropTypes.bool.isRequired,
  linewrap: PropTypes.bool.isRequired,
  setLineNumbers: PropTypes.func.isRequired,
  setAutosave: PropTypes.func.isRequired,
  setLinewrap: PropTypes.func.isRequired,
  textOutput: PropTypes.bool.isRequired,
  gridOutput: PropTypes.bool.isRequired,
  soundOutput: PropTypes.bool.isRequired,
  setTextOutput: PropTypes.func.isRequired,
  setGridOutput: PropTypes.func.isRequired,
  setSoundOutput: PropTypes.func.isRequired,
  lintWarning: PropTypes.bool.isRequired,
  setLintWarning: PropTypes.func.isRequired,
  theme: PropTypes.string.isRequired,
  setTheme: PropTypes.func.isRequired,
};

export default Preferences;
