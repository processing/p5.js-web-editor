import PropTypes from 'prop-types';
import React from 'react';
import { Helmet } from 'react-helmet';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { withTranslation } from 'react-i18next';
// import { bindActionCreators } from 'redux';
// import { connect } from 'react-redux';
// import * as PreferencesActions from '../actions/preferences';

import PlusIcon from '../../../../images/plus.svg';
import MinusIcon from '../../../../images/minus.svg';
import beepUrl from '../../../../sounds/audioAlert.mp3';

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
            <div className="tabs__titles">
              <Tab>
                <h4 className="tabs__title">
                  {this.props.t('Preferences.GeneralSettings')}
                </h4>
              </Tab>
              <Tab>
                <h4 className="tabs__title">
                  {this.props.t('Preferences.Accessibility')}
                </h4>
              </Tab>
            </div>
          </TabList>
          <TabPanel>
            <div className="preference">
              <h4 className="preference__title">
                {this.props.t('Preferences.Theme')}
              </h4>
              <div className="preference__options">
                <input
                  type="radio"
                  onChange={() => this.props.setTheme('light')}
                  aria-label={this.props.t('Preferences.LightThemeARIA')}
                  name="light theme"
                  id="light-theme-on"
                  className="preference__radio-button"
                  value="light"
                  checked={this.props.theme === 'light'}
                />
                <label htmlFor="light-theme-on" className="preference__option">
                  {this.props.t('Preferences.LightTheme')}
                </label>
                <input
                  type="radio"
                  onChange={() => this.props.setTheme('dark')}
                  aria-label={this.props.t('Preferences.DarkThemeARIA')}
                  name="dark theme"
                  id="dark-theme-on"
                  className="preference__radio-button"
                  value="dark"
                  checked={this.props.theme === 'dark'}
                />
                <label htmlFor="dark-theme-on" className="preference__option">
                  {this.props.t('Preferences.DarkTheme')}
                </label>
                <input
                  type="radio"
                  onChange={() => this.props.setTheme('contrast')}
                  aria-label={this.props.t('Preferences.HighContrastThemeARIA')}
                  name="high contrast theme"
                  id="high-contrast-theme-on"
                  className="preference__radio-button"
                  value="contrast"
                  checked={this.props.theme === 'contrast'}
                />
                <label
                  htmlFor="high-contrast-theme-on"
                  className="preference__option"
                >
                  {this.props.t('Preferences.HighContrastTheme')}
                </label>
              </div>
            </div>
            <div className="preference">
              <h4 className="preference__title">
                {this.props.t('Preferences.TextSize')}
              </h4>
              <button
                className="preference__minus-button"
                onClick={this.decreaseFontSize}
                aria-label={this.props.t('Preferences.DecreaseFontARIA')}
                disabled={this.state.fontSize <= 8}
              >
                <MinusIcon focusable="false" aria-hidden="true" />
                <h6 className="preference__label">
                  {this.props.t('Preferences.DecreaseFont')}
                </h6>
              </button>
              <form
                onSubmit={this.onFontInputSubmit}
                data-testid="font-size-form"
              >
                <input
                  className="preference__value"
                  aria-live="polite"
                  aria-atomic="true"
                  value={this.state.fontSize}
                  onChange={this.onFontInputChange}
                  type="text"
                  ref={(element) => {
                    this.fontSizeInput = element;
                  }}
                  onClick={() => {
                    this.fontSizeInput.select();
                  }}
                  data-testid="font-size-text-field"
                />
              </form>
              <button
                className="preference__plus-button"
                onClick={this.increaseFontSize}
                aria-label={this.props.t('Preferences.IncreaseFontARIA')}
                disabled={this.state.fontSize >= 36}
              >
                <PlusIcon focusable="false" aria-hidden="true" />
                <h6 className="preference__label">
                  {this.props.t('Preferences.IncreaseFont')}
                </h6>
              </button>
            </div>
            <div className="preference">
              <h4 className="preference__title">
                {this.props.t('Preferences.Autosave')}
              </h4>
              <div className="preference__options">
                <input
                  type="radio"
                  onChange={() => this.props.setAutosave(true)}
                  aria-label={this.props.t('Preferences.AutosaveOnARIA')}
                  name="autosave"
                  id="autosave-on"
                  className="preference__radio-button"
                  value="On"
                  checked={this.props.autosave}
                />
                <label htmlFor="autosave-on" className="preference__option">
                  {this.props.t('Preferences.On')}
                </label>
                <input
                  type="radio"
                  onChange={() => this.props.setAutosave(false)}
                  aria-label={this.props.t('Preferences.AutosaveOffARIA')}
                  name="autosave"
                  id="autosave-off"
                  className="preference__radio-button"
                  value="Off"
                  checked={!this.props.autosave}
                />
                <label htmlFor="autosave-off" className="preference__option">
                  {this.props.t('Preferences.Off')}
                </label>
              </div>
            </div>
            <div className="preference">
              <h4 className="preference__title">
                {this.props.t('Preferences.AutocloseBracketsQuotes')}
              </h4>
              <div className="preference__options">
                <input
                  type="radio"
                  onChange={() => this.props.setAutocloseBracketsQuotes(true)}
                  aria-label={this.props.t(
                    'Preferences.AutocloseBracketsQuotesOnARIA'
                  )}
                  name="autoclosebracketsquotes"
                  id="autoclosebracketsquotes-on"
                  className="preference__radio-button"
                  value="On"
                  checked={this.props.autocloseBracketsQuotes}
                />
                <label
                  htmlFor="autoclosebracketsquotes-on"
                  className="preference__option"
                >
                  {this.props.t('Preferences.On')}
                </label>
                <input
                  type="radio"
                  onChange={() => this.props.setAutocloseBracketsQuotes(false)}
                  aria-label={this.props.t(
                    'Preferences.AutocloseBracketsQuotesOffARIA'
                  )}
                  name="autoclosebracketsquotes"
                  id="autoclosebracketsquotes-off"
                  className="preference__radio-button"
                  value="Off"
                  checked={!this.props.autocloseBracketsQuotes}
                />
                <label
                  htmlFor="autoclosebracketsquotes-off"
                  className="preference__option"
                >
                  {this.props.t('Preferences.Off')}
                </label>
              </div>
            </div>
            <div className="preference">
              <h4 className="preference__title">
                {this.props.t('Preferences.WordWrap')}
              </h4>
              <div className="preference__options">
                <input
                  type="radio"
                  onChange={() => this.props.setLinewrap(true)}
                  aria-label={this.props.t('Preferences.LineWrapOnARIA')}
                  name="linewrap"
                  id="linewrap-on"
                  className="preference__radio-button"
                  value="On"
                  checked={this.props.linewrap}
                />
                <label htmlFor="linewrap-on" className="preference__option">
                  {this.props.t('Preferences.On')}
                </label>
                <input
                  type="radio"
                  onChange={() => this.props.setLinewrap(false)}
                  aria-label={this.props.t('Preferences.LineWrapOffARIA')}
                  name="linewrap"
                  id="linewrap-off"
                  className="preference__radio-button"
                  value="Off"
                  checked={!this.props.linewrap}
                />
                <label htmlFor="linewrap-off" className="preference__option">
                  {this.props.t('Preferences.Off')}
                </label>
              </div>
            </div>
          </TabPanel>
          <TabPanel>
            <div className="preference">
              <h4 className="preference__title">
                {this.props.t('Preferences.LineNumbers')}
              </h4>
              <div className="preference__options">
                <input
                  type="radio"
                  onChange={() => this.props.setLineNumbers(true)}
                  aria-label={this.props.t('Preferences.LineNumbersOnARIA')}
                  name="line numbers"
                  id="line-numbers-on"
                  className="preference__radio-button"
                  value="On"
                  checked={this.props.lineNumbers}
                />
                <label htmlFor="line-numbers-on" className="preference__option">
                  {this.props.t('Preferences.On')}
                </label>
                <input
                  type="radio"
                  onChange={() => this.props.setLineNumbers(false)}
                  aria-label={this.props.t('Preferences.LineNumbersOffARIA')}
                  name="line numbers"
                  id="line-numbers-off"
                  className="preference__radio-button"
                  value="Off"
                  checked={!this.props.lineNumbers}
                />
                <label
                  htmlFor="line-numbers-off"
                  className="preference__option"
                >
                  {this.props.t('Preferences.Off')}
                </label>
              </div>
            </div>
            <div className="preference">
              <h4 className="preference__title">
                {this.props.t('Preferences.LintWarningSound')}
              </h4>
              <div className="preference__options">
                <input
                  type="radio"
                  onChange={() => this.props.setLintWarning(true)}
                  aria-label={this.props.t('Preferences.LintWarningOnARIA')}
                  name="lint warning"
                  id="lint-warning-on"
                  className="preference__radio-button"
                  value="On"
                  checked={this.props.lintWarning}
                />
                <label htmlFor="lint-warning-on" className="preference__option">
                  {this.props.t('Preferences.On')}
                </label>
                <input
                  type="radio"
                  onChange={() => this.props.setLintWarning(false)}
                  aria-label={this.props.t('Preferences.LintWarningOffARIA')}
                  name="lint warning"
                  id="lint-warning-off"
                  className="preference__radio-button"
                  value="Off"
                  checked={!this.props.lintWarning}
                />
                <label
                  htmlFor="lint-warning-off"
                  className="preference__option"
                >
                  {this.props.t('Preferences.Off')}
                </label>
                <button
                  className="preference__preview-button"
                  onClick={() => beep.play()}
                  aria-label={this.props.t('Preferences.PreviewSoundARIA')}
                >
                  {this.props.t('Preferences.PreviewSound')}
                </button>
              </div>
            </div>
            <div className="preference">
              <h4 className="preference__title">
                {this.props.t('Preferences.AccessibleTextBasedCanvas')}
              </h4>
              <h6 className="preference__subtitle">
                {this.props.t('Preferences.UsedScreenReader')}
              </h6>

              <div className="preference__options">
                <input
                  type="checkbox"
                  onChange={(event) => {
                    this.props.setTextOutput(event.target.checked);
                  }}
                  aria-label={this.props.t('Preferences.TextOutputARIA')}
                  name="text output"
                  id="text-output-on"
                  value="On"
                  checked={this.props.textOutput}
                />
                <label
                  htmlFor="text-output-on"
                  className="preference__option preference__canvas"
                >
                  {this.props.t('Preferences.PlainText')}
                </label>
                <input
                  type="checkbox"
                  onChange={(event) => {
                    this.props.setGridOutput(event.target.checked);
                  }}
                  aria-label={this.props.t('Preferences.TableOutputARIA')}
                  name="table output"
                  id="table-output-on"
                  value="On"
                  checked={this.props.gridOutput}
                />
                <label
                  htmlFor="table-output-on"
                  className="preference__option preference__canvas"
                >
                  {this.props.t('Preferences.TableText')}
                </label>
                <input
                  type="checkbox"
                  onChange={(event) => {
                    this.props.setSoundOutput(event.target.checked);
                  }}
                  aria-label={this.props.t('Preferences.SoundOutputARIA')}
                  name="sound output"
                  id="sound-output-on"
                  value="On"
                  checked={this.props.soundOutput}
                />
                <label
                  htmlFor="sound-output-on"
                  className="preference__option preference__canvas"
                >
                  {this.props.t('Preferences.Sound')}
                </label>
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
  autocloseBracketsQuotes: PropTypes.bool.isRequired,
  setAutocloseBracketsQuotes: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired
};

export default withTranslation()(Preferences);
