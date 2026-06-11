import i18next from 'i18next';
import * as ActionTypes from '../../../constants';
import { savePreferences } from '../../../persistPreferences';
import type {
  UpdatePreferencesDispatch,
  SetPreferencesTabValue,
  SetFontSizeValue,
  SetLineNumbersValue,
  SetAutocloseBracketsQuotesValue,
  SetAutocompleteHinterValue,
  SetAutosaveValue,
  SetLinewrapValue,
  SetLintWarningValue,
  SetTextOutputValue,
  SetAllAccessibleOutputValue,
  SetAutorefreshValue,
  SetGridOutputValue,
  SetLanguageValue,
  SetThemeValue
} from './preferences.types';
import type { GetRootState } from '../../../reducers';

// Preferences persist to localStorage (per browser) rather than the server.
// Persisting after dispatch means we store the already-updated slice.
function persistPreferences(getState: GetRootState) {
  savePreferences(getState().preferences);
}

export function setPreferencesTab(value: SetPreferencesTabValue) {
  return {
    type: ActionTypes.SET_PREFERENCES_TAB,
    value
  };
}

export function setFontSize(value: SetFontSizeValue) {
  return (dispatch: UpdatePreferencesDispatch, getState: GetRootState) => {
    dispatch({
      type: ActionTypes.SET_FONT_SIZE,
      value
    });
    persistPreferences(getState);
  };
}

export function setLineNumbers(value: SetLineNumbersValue) {
  return (dispatch: UpdatePreferencesDispatch, getState: GetRootState) => {
    dispatch({
      type: ActionTypes.SET_LINE_NUMBERS,
      value
    });
    persistPreferences(getState);
  };
}

export function setAutocloseBracketsQuotes(
  value: SetAutocloseBracketsQuotesValue
) {
  return (dispatch: UpdatePreferencesDispatch, getState: GetRootState) => {
    dispatch({
      type: ActionTypes.SET_AUTOCLOSE_BRACKETS_QUOTES,
      value
    });
    persistPreferences(getState);
  };
}

export function setAutocompleteHinter(value: SetAutocompleteHinterValue) {
  return (dispatch: UpdatePreferencesDispatch, getState: GetRootState) => {
    dispatch({
      type: ActionTypes.SET_AUTOCOMPLETE_HINTER,
      value
    });
    persistPreferences(getState);
  };
}

export function setAutosave(value: SetAutosaveValue) {
  return (dispatch: UpdatePreferencesDispatch, getState: GetRootState) => {
    dispatch({
      type: ActionTypes.SET_AUTOSAVE,
      value
    });
    persistPreferences(getState);
  };
}

export function setLinewrap(value: SetLinewrapValue) {
  return (dispatch: UpdatePreferencesDispatch, getState: GetRootState) => {
    dispatch({
      type: ActionTypes.SET_LINEWRAP,
      value
    });
    persistPreferences(getState);
  };
}

export function setLintWarning(value: SetLintWarningValue) {
  return (dispatch: UpdatePreferencesDispatch, getState: GetRootState) => {
    dispatch({
      type: ActionTypes.SET_LINT_WARNING,
      value
    });
    persistPreferences(getState);
  };
}

export function setTextOutput(value: SetTextOutputValue) {
  return (dispatch: UpdatePreferencesDispatch, getState: GetRootState) => {
    dispatch({
      type: ActionTypes.SET_TEXT_OUTPUT,
      value
    });
    persistPreferences(getState);
  };
}

export function setGridOutput(value: SetGridOutputValue) {
  return (dispatch: UpdatePreferencesDispatch, getState: GetRootState) => {
    dispatch({
      type: ActionTypes.SET_GRID_OUTPUT,
      value
    });
    persistPreferences(getState);
  };
}

export function setTheme(value: SetThemeValue) {
  return (dispatch: UpdatePreferencesDispatch, getState: GetRootState) => {
    dispatch({
      type: ActionTypes.SET_THEME,
      value
    });
    persistPreferences(getState);
  };
}

export function setAutorefresh(value: SetAutorefreshValue) {
  return (dispatch: UpdatePreferencesDispatch, getState: GetRootState) => {
    dispatch({
      type: ActionTypes.SET_AUTOREFRESH,
      value
    });
    persistPreferences(getState);
  };
}

export function setAllAccessibleOutput(value: SetAllAccessibleOutputValue) {
  return (dispatch: UpdatePreferencesDispatch) => {
    dispatch(setTextOutput(value));
    dispatch(setGridOutput(value));
  };
}

export function setLanguage(
  value: SetLanguageValue,
  { persistPreference = true } = {}
) {
  return (dispatch: UpdatePreferencesDispatch, getState: GetRootState) => {
    i18next.changeLanguage(value);
    dispatch({
      type: ActionTypes.SET_LANGUAGE,
      language: value
    });
    if (persistPreference) {
      persistPreferences(getState);
    }
  };
}
