import { createSlice } from '@reduxjs/toolkit';

export const initialState = {
  fontSize: 18,
  autosave: true,
  linewrap: true,
  lineNumbers: true,
  lintWarning: false,
  textOutput: false,
  gridOutput: false,
  theme: 'light',
  autorefresh: false,
  language: 'en-US',
  autocloseBracketsQuotes: true,
  autocompleteHinter: false
};

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    setFontSizeActions: (state, action) => {
      state.fontSize = action.payload;
    },
    setAutoSaveActions: (state, action) => {
      state.autosave = action.payload;
    },
    setLineWrapActions: (state, action) => {
      state.linewrap = action.payload;
    },
    setLintWarningActions: (state, action) => {
      state.lintWarning = action.payload;
    },
    setTextOutputActions: (state, action) => {
      state.textOutput = action.payload;
    },
    setGridOutputActions: (state, action) => {
      state.gridOutput = action.payload;
    },
    setPreferencesActions(state, action) {
      return action.payload;
    },
    setThemeActions: (state, action) => {
      state.theme = action.payload;
    },
    setAutoRefreshActions: (state, action) => {
      state.autorefresh = action.payload;
    },
    setLineNumbersActions: (state, action) => {
      state.lineNumbers = action.payload;
    },
    setAutocloseBracketsQuotesActions: (state, action) => {
      state.autocloseBracketsQuotes = action.payload;
    },
    setAutocompleteHinterActions: (state, action) => {
      state.autocompleteHinter = action.payload;
    },
    setLanguageActions: (state, action) => {
      state.language = action.payload;
    }
  }
});

export const preferencesActions = preferencesSlice.actions;

export default preferencesSlice.reducer;
