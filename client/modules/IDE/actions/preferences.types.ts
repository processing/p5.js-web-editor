import * as ActionTypes from '../../../constants';
import type { PreferencesState } from '../reducers/preferences';
import type { RootState } from '../../../reducers';

// Value Definitions:
export type SetPreferencesTabValue = PreferencesState['tabIndex'];
export type SetFontSizeValue = PreferencesState['fontSize'];
export type SetLineNumbersValue = PreferencesState['lineNumbers'];
export type SetAutocloseBracketsQuotesValue = PreferencesState['autocloseBracketsQuotes'];
export type SetAutocompleteHinterValue = PreferencesState['autocompleteHinter'];
export type SetAutosaveValue = PreferencesState['autosave'];
export type SetLinewrapValue = PreferencesState['linewrap'];
export type SetLintWarningValue = PreferencesState['lintWarning'];
export type SetTextOutputValue = PreferencesState['textOutput'];
export type SetGridOutputValue = PreferencesState['gridOutput'];
export type SetThemeValue = PreferencesState['theme'];
export type SetAutorefreshValue = PreferencesState['autorefresh'];
export type SetLanguageValue = PreferencesState['language'];
export type SetAllAccessibleOutputValue =
  | SetTextOutputValue
  | SetGridOutputValue;

// Action Definitions:
export type OpenPreferencesAction = {
  type: typeof ActionTypes.OPEN_PREFERENCES;
};
export type SetPreferencesAction = {
  type: typeof ActionTypes.SET_PREFERENCES;
  preferences: PreferencesState;
};
export type SetErrorAction = {
  type: typeof ActionTypes.ERROR;
  error: unknown;
};

export type SetPreferencesTabAction = {
  type: typeof ActionTypes.SET_PREFERENCES_TAB;
  value: SetPreferencesTabValue;
};
export type SetFontSizeAction = {
  type: typeof ActionTypes.SET_FONT_SIZE;
  value: SetFontSizeValue;
};
export type SetLineNumbersAction = {
  type: typeof ActionTypes.SET_LINE_NUMBERS;
  value: SetLineNumbersValue;
};
export type SetAutocloseBracketsQuotesAction = {
  type: typeof ActionTypes.SET_AUTOCLOSE_BRACKETS_QUOTES;
  value: SetAutocloseBracketsQuotesValue;
};
export type SetAutocompleteHinterAction = {
  type: typeof ActionTypes.SET_AUTOCOMPLETE_HINTER;
  value: SetAutocompleteHinterValue;
};
export type SetAutosaveAction = {
  type: typeof ActionTypes.SET_AUTOSAVE;
  value: SetAutosaveValue;
};
export type SetLinewrapAction = {
  type: typeof ActionTypes.SET_LINEWRAP;
  value: SetLinewrapValue;
};
export type SetLintWarningAction = {
  type: typeof ActionTypes.SET_LINT_WARNING;
  value: SetLintWarningValue;
};
export type SetTextOutputAction = {
  type: typeof ActionTypes.SET_TEXT_OUTPUT;
  value: SetTextOutputValue;
};
export type SetGridOutputAction = {
  type: typeof ActionTypes.SET_GRID_OUTPUT;
  value: SetGridOutputValue;
};
export type SetThemeAction = {
  type: typeof ActionTypes.SET_THEME;
  value: SetThemeValue;
};
export type SetAutorefreshAction = {
  type: typeof ActionTypes.SET_AUTOREFRESH;
  value: SetAutorefreshValue;
};
export type SetLanguageAction = {
  type: typeof ActionTypes.SET_LANGUAGE;
  language: SetLanguageValue;
};

export type PreferencesAction =
  | OpenPreferencesAction
  | SetPreferencesAction
  | SetErrorAction
  | SetPreferencesTabAction
  | SetFontSizeAction
  | SetLineNumbersAction
  | SetAutocloseBracketsQuotesAction
  | SetAutocompleteHinterAction
  | SetAutosaveAction
  | SetLinewrapAction
  | SetLintWarningAction
  | SetTextOutputAction
  | SetGridOutputAction
  | SetThemeAction
  | SetAutorefreshAction
  | SetLanguageAction;

export type UpdatePreferencesDispatch = (
  action: PreferencesAction | PreferencesThunk
) => void;

export type PreferencesThunk = (
  dispatch: UpdatePreferencesDispatch,
  getState: GetRootState
) => void;

export type GetRootState = () => RootState;
