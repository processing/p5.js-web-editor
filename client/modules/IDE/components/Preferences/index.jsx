import React, { useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useDispatch, useSelector } from 'react-redux';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { useTranslation } from 'react-i18next';
import PlusIcon from '../../../../images/plus.svg';
import MinusIcon from '../../../../images/minus.svg';
import beepUrl from '../../../../sounds/audioAlert.mp3';
import {
  setTheme,
  setAutosave,
  setTextOutput,
  setGridOutput,
  setFontSize,
  setLineNumbers,
  setLintWarning,
  setAutocloseBracketsQuotes,
  setAutocompleteHinter,
  setLinewrap
} from '../../actions/preferences';

export default function Preferences() {
  const { t } = useTranslation();

  const dispatch = useDispatch();

  const {
    fontSize,
    autosave,
    linewrap,
    lineNumbers,
    lintWarning,
    textOutput,
    gridOutput,
    theme,
    autocloseBracketsQuotes,
    autocompleteHinter
  } = useSelector((state) => state.preferences);

  const [state, setState] = useState({ fontSize });

  function onFontInputChange(event) {
    const INTEGER_REGEX = /^[0-9\b]+$/;
    if (event.target.value === '' || INTEGER_REGEX.test(event.target.value)) {
      setState({
        fontSize: event.target.value
      });
    }
  }

  function handleFontSize(value) {
    setState({ fontSize: value });
    dispatch(setFontSize(value));
  }

  function onFontInputSubmit(event) {
    event.preventDefault();
    let value = parseInt(state.fontSize, 10);
    if (Number.isNaN(value)) {
      value = 16;
    }
    if (value > 36) {
      value = 36;
    }
    if (value < 8) {
      value = 8;
    }
    handleFontSize(value);
  }

  function decreaseFontSize() {
    const newValue = Number(state.fontSize) - 2;
    handleFontSize(newValue);
  }

  function increaseFontSize() {
    const newValue = Number(state.fontSize) + 2;
    handleFontSize(newValue);
  }

  const fontSizeInputRef = useRef(null);

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
                {t('Preferences.GeneralSettings')}
              </h4>
            </Tab>
            <Tab>
              <h4 className="tabs__title">{t('Preferences.Accessibility')}</h4>
            </Tab>
          </div>
        </TabList>
        <TabPanel>
          <div className="preference">
            <h4 className="preference__title">{t('Preferences.Theme')}</h4>
            <div className="preference__options">
              <input
                type="radio"
                onChange={() => dispatch(setTheme('light'))}
                aria-label={t('Preferences.LightThemeARIA')}
                name="light theme"
                id="light-theme-on"
                className="preference__radio-button"
                value="light"
                checked={theme === 'light'}
              />
              <label htmlFor="light-theme-on" className="preference__option">
                {t('Preferences.LightTheme')}
              </label>
              <input
                type="radio"
                onChange={() => dispatch(setTheme('dark'))}
                aria-label={t('Preferences.DarkThemeARIA')}
                name="dark theme"
                id="dark-theme-on"
                className="preference__radio-button"
                value="dark"
                checked={theme === 'dark'}
              />
              <label htmlFor="dark-theme-on" className="preference__option">
                {t('Preferences.DarkTheme')}
              </label>
              <input
                type="radio"
                onChange={() => dispatch(setTheme('contrast'))}
                aria-label={t('Preferences.HighContrastThemeARIA')}
                name="high contrast theme"
                id="high-contrast-theme-on"
                className="preference__radio-button"
                value="contrast"
                checked={theme === 'contrast'}
              />
              <label
                htmlFor="high-contrast-theme-on"
                className="preference__option"
              >
                {t('Preferences.HighContrastTheme')}
              </label>
            </div>
          </div>
          <div className="preference">
            <h4 className="preference__title">{t('Preferences.TextSize')}</h4>
            <button
              className="preference__minus-button"
              onClick={decreaseFontSize}
              aria-label={t('Preferences.DecreaseFontARIA')}
              title={t('Preferences.DecreaseFontARIA')}
              disabled={fontSize <= 8}
            >
              <MinusIcon focusable="false" aria-hidden="true" />
              <h6 className="preference__label">
                {t('Preferences.DecreaseFont')}
              </h6>
            </button>
            <form
              onSubmit={onFontInputSubmit}
              aria-label={t('Preferences.SetFontSize')}
            >
              <label htmlFor="font-size-value" className="preference--hidden">
                {t('Preferences.FontSize')}
              </label>
              <input
                className="preference__value"
                aria-live="polite"
                aria-atomic="true"
                value={state.fontSize}
                id="font-size-value"
                onChange={onFontInputChange}
                type="text"
                ref={fontSizeInputRef}
                onClick={() => {
                  fontSizeInputRef.current?.select();
                }}
              />
            </form>
            <button
              className="preference__plus-button"
              onClick={increaseFontSize}
              aria-label={t('Preferences.IncreaseFontARIA')}
              title={t('Preferences.IncreaseFontARIA')}
              disabled={fontSize >= 36}
            >
              <PlusIcon focusable="false" aria-hidden="true" />
              <h6 className="preference__label">
                {t('Preferences.IncreaseFont')}
              </h6>
            </button>
          </div>
          <div className="preference">
            <h4 className="preference__title">{t('Preferences.Autosave')}</h4>
            <div className="preference__options">
              <input
                type="radio"
                onChange={() => dispatch(setAutosave(true))}
                aria-label={t('Preferences.AutosaveOnARIA')}
                name="autosave"
                id="autosave-on"
                className="preference__radio-button"
                value="On"
                checked={autosave}
              />
              <label htmlFor="autosave-on" className="preference__option">
                {t('Preferences.On')}
              </label>
              <input
                type="radio"
                onChange={() => dispatch(setAutosave(false))}
                aria-label={t('Preferences.AutosaveOffARIA')}
                name="autosave"
                id="autosave-off"
                className="preference__radio-button"
                value="Off"
                checked={!autosave}
              />
              <label htmlFor="autosave-off" className="preference__option">
                {t('Preferences.Off')}
              </label>
            </div>
          </div>
          <div className="preference">
            <h4 className="preference__title">
              {t('Preferences.AutocloseBracketsQuotes')}
            </h4>
            <div className="preference__options">
              <input
                type="radio"
                onChange={() => dispatch(setAutocloseBracketsQuotes(true))}
                aria-label={t('Preferences.AutocloseBracketsQuotesOnARIA')}
                name="autoclosebracketsquotes"
                id="autoclosebracketsquotes-on"
                className="preference__radio-button"
                value="On"
                checked={autocloseBracketsQuotes}
              />
              <label
                htmlFor="autoclosebracketsquotes-on"
                className="preference__option"
              >
                {t('Preferences.On')}
              </label>
              <input
                type="radio"
                onChange={() => dispatch(setAutocloseBracketsQuotes(false))}
                aria-label={t('Preferences.AutocloseBracketsQuotesOffARIA')}
                name="autoclosebracketsquotes"
                id="autoclosebracketsquotes-off"
                className="preference__radio-button"
                value="Off"
                checked={!autocloseBracketsQuotes}
              />
              <label
                htmlFor="autoclosebracketsquotes-off"
                className="preference__option"
              >
                {t('Preferences.Off')}
              </label>
            </div>
          </div>
          <div className="preference">
            <h4 className="preference__title">
              {t('Preferences.AutocompleteHinter')}
            </h4>
            <div className="preference__options">
              <input
                type="radio"
                onChange={() => dispatch(setAutocompleteHinter(true))}
                aria-label={t('Preferences.AutocompleteHinterOnARIA')}
                name="autocompletehinter"
                id="autocompletehinter-on"
                className="preference__radio-button"
                value="On"
                checked={autocompleteHinter}
              />
              <label
                htmlFor="autocompletehinter-on"
                className="preference__option"
              >
                {t('Preferences.On')}
              </label>
              <input
                type="radio"
                onChange={() => dispatch(setAutocompleteHinter(false))}
                aria-label={t('Preferences.AutocompleteHinterOffARIA')}
                name="autocompletehinter"
                id="autocompletehinter-off"
                className="preference__radio-button"
                value="Off"
                checked={!autocompleteHinter}
              />
              <label
                htmlFor="autocompletehinter-off"
                className="preference__option"
              >
                {t('Preferences.Off')}
              </label>
            </div>
          </div>
          <div className="preference">
            <h4 className="preference__title">{t('Preferences.WordWrap')}</h4>
            <div className="preference__options">
              <input
                type="radio"
                onChange={() => dispatch(setLinewrap(true))}
                aria-label={t('Preferences.LineWrapOnARIA')}
                name="linewrap"
                id="linewrap-on"
                className="preference__radio-button"
                value="On"
                checked={linewrap}
              />
              <label htmlFor="linewrap-on" className="preference__option">
                {t('Preferences.On')}
              </label>
              <input
                type="radio"
                onChange={() => dispatch(setLinewrap(false))}
                aria-label={t('Preferences.LineWrapOffARIA')}
                name="linewrap"
                id="linewrap-off"
                className="preference__radio-button"
                value="Off"
                checked={!linewrap}
              />
              <label htmlFor="linewrap-off" className="preference__option">
                {t('Preferences.Off')}
              </label>
            </div>
          </div>
        </TabPanel>
        <TabPanel>
          <div className="preference">
            <h4 className="preference__title">
              {t('Preferences.LineNumbers')}
            </h4>
            <div className="preference__options">
              <input
                type="radio"
                onChange={() => dispatch(setLineNumbers(true))}
                aria-label={t('Preferences.LineNumbersOnARIA')}
                name="line numbers"
                id="line-numbers-on"
                className="preference__radio-button"
                value="On"
                checked={lineNumbers}
              />
              <label htmlFor="line-numbers-on" className="preference__option">
                {t('Preferences.On')}
              </label>
              <input
                type="radio"
                onChange={() => dispatch(setLineNumbers(false))}
                aria-label={t('Preferences.LineNumbersOffARIA')}
                name="line numbers"
                id="line-numbers-off"
                className="preference__radio-button"
                value="Off"
                checked={!lineNumbers}
              />
              <label htmlFor="line-numbers-off" className="preference__option">
                {t('Preferences.Off')}
              </label>
            </div>
          </div>
          <div className="preference">
            <h4 className="preference__title">
              {t('Preferences.LintWarningSound')}
            </h4>
            <div className="preference__options">
              <input
                type="radio"
                onChange={() => dispatch(setLintWarning(true))}
                aria-label={t('Preferences.LintWarningOnARIA')}
                name="lint warning"
                id="lint-warning-on"
                className="preference__radio-button"
                value="On"
                checked={lintWarning}
              />
              <label htmlFor="lint-warning-on" className="preference__option">
                {t('Preferences.On')}
              </label>
              <input
                type="radio"
                onChange={() => dispatch(setLintWarning(false))}
                aria-label={t('Preferences.LintWarningOffARIA')}
                name="lint warning"
                id="lint-warning-off"
                className="preference__radio-button"
                value="Off"
                checked={!lintWarning}
              />
              <label htmlFor="lint-warning-off" className="preference__option">
                {t('Preferences.Off')}
              </label>
              <button
                className="preference__preview-button"
                onClick={() => new Audio(beepUrl).play()}
                aria-label={t('Preferences.PreviewSoundARIA')}
              >
                {t('Preferences.PreviewSound')}
              </button>
            </div>
          </div>
          <div className="preference">
            <h4 className="preference__title">
              {t('Preferences.AccessibleTextBasedCanvas')}
            </h4>
            <h6 className="preference__subtitle">
              {t('Preferences.UsedScreenReader')}
            </h6>

            <div className="preference__options">
              <input
                type="checkbox"
                onChange={(event) => {
                  dispatch(setTextOutput(event.target.checked));
                }}
                aria-label={t('Preferences.TextOutputARIA')}
                name="text output"
                id="text-output-on"
                value="On"
                checked={textOutput}
              />
              <label
                htmlFor="text-output-on"
                className="preference__option preference__canvas"
              >
                {t('Preferences.PlainText')}
              </label>
              <input
                type="checkbox"
                onChange={(event) => {
                  dispatch(setGridOutput(event.target.checked));
                }}
                aria-label={t('Preferences.TableOutputARIA')}
                name="table output"
                id="table-output-on"
                value="On"
                checked={gridOutput}
              />
              <label
                htmlFor="table-output-on"
                className="preference__option preference__canvas"
              >
                {t('Preferences.TableText')}
              </label>
            </div>
          </div>
        </TabPanel>
      </Tabs>
    </section>
  );
}
