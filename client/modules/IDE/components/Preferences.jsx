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
const infoUrl = require('../../../images/information.svg');

class Preferences extends React.Component {
  constructor(props) {
    super(props);
    this.handleUpdateAutosave = this.handleUpdateAutosave.bind(this);
    this.handleUpdateFont = this.handleUpdateFont.bind(this);
    this.handleUpdateIndentation = this.handleUpdateIndentation.bind(this);
    this.handleLintWarning = this.handleLintWarning.bind(this);
  }

  handleUpdateFont(event) {
    let value = parseInt(event.target.value, 10);
    if (isNaN(value)) {
      value = 16;
    }
    this.props.setFontSize(value);
  }

  handleUpdateIndentation(event) {
    let value = parseInt(event.target.value, 10);
    if (isNaN(value)) {
      value = 2;
    }
    this.props.setIndentation(value);
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
    const beep = new Audio(beepUrl);

    return (
      <section className="preferences" tabIndex="0" title="preference-menu">
        <Helmet>
          <title>p5.js Web Editor | Preferences</title>
        </Helmet>
        <Tabs>
          <TabList>
            <div className="preference__subheadings">
              <Tab><h4 className="preference__subheading">General Settings</h4></Tab>
              <Tab><h4 className="preference__subheading">Sketch Settings</h4></Tab>
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
                onClick={() => this.props.setFontSize(this.props.fontSize - 2)}
                aria-label="decrease font size"
              >
                <InlineSVG src={minusUrl} alt="Decrease Font Size" />
                <h6 className="preference__label">Decrease</h6>
              </button>
              <input
                className="preference__value"
                aria-live="polite"
                aria-atomic="true"
                role="status"
                value={this.props.fontSize}
                onChange={this.handleUpdateFont}
                ref={(element) => { this.fontSizeInput = element; }}
                onClick={() => {
                  this.fontSizeInput.select();
                }}
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
              <h4 className="preference__title">Indentation amount</h4>
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
                aria-live="polite"
                aria-atomic="true"
                role="status"
                value={this.props.indentationAmount}
                onChange={this.handleUpdateIndentation}
                ref={(element) => { this.indentationInput = element; }}
                onClick={() => {
                  this.indentationInput.select();
                }}
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
              <label
                htmlFor="indentation-space"
                className="preference__option preference__whitespace-button"
              >
                Spaces
              </label>
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
              <label htmlFor="indentation-tab" className="preference__option preference__whitespace-button">Tabs</label>
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
          </TabPanel>
          <TabPanel>
            {/* <div className="preference">
              <h4 className="preference__title">Add a p5.js or an external library</h4>
            </div> */}
            <div className="preference">
              <h4 className="preference__title">Security Protocol</h4>
              <div className="preference__serve-secure">
                <input
                  id="serve-secure"
                  type="checkbox"
                  checked={this.props.serveSecure || false}
                  onChange={(event) => {
                    this.props.setServeSecure(event.target.checked);
                  }}
                />
                <label htmlFor="serve-secure">Serve over HTTPS</label>
                <span
                  className="serve-secture__tooltip tooltipped tooltipped-n tooltipped-no-delay tooltipped-multiline"
                  aria-label={'Choose HTTPS if you need to \n • access a microphone or webcam \n'
                      + '• access an API served over HTTPS \n\n'
                      + 'Choose HTTP if you need to \n'
                      + '• access an API served over HTTP'}
                >
                  <InlineSVG src={infoUrl} className="serve-secure__icon" />
                </span>
              </div>
            </div>
          </TabPanel>
          <TabPanel>
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
  indentationAmount: PropTypes.number.isRequired,
  setIndentation: PropTypes.func.isRequired,
  indentWithSpace: PropTypes.func.isRequired,
  indentWithTab: PropTypes.func.isRequired,
  isTabIndent: PropTypes.bool.isRequired,
  setFontSize: PropTypes.func.isRequired,
  autosave: PropTypes.bool.isRequired,
  setAutosave: PropTypes.func.isRequired,
  textOutput: PropTypes.bool.isRequired,
  gridOutput: PropTypes.bool.isRequired,
  soundOutput: PropTypes.bool.isRequired,
  setTextOutput: PropTypes.func.isRequired,
  setGridOutput: PropTypes.func.isRequired,
  setSoundOutput: PropTypes.func.isRequired,
  lintWarning: PropTypes.bool.isRequired,
  setLintWarning: PropTypes.func.isRequired,
  theme: PropTypes.string.isRequired,
  serveSecure: PropTypes.bool.isRequired,
  setServeSecure: PropTypes.func.isRequired,
  setTheme: PropTypes.func.isRequired
};

Preferences.defaultProps = {
  currentUser: undefined
};

export default Preferences;
