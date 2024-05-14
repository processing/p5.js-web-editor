import { createSlice } from '@reduxjs/toolkit';

const consoleMax = 5000;
const initialState = [];

const consoleSlice = createSlice({
  name: 'console',
  initialState,
  reducers: {
    dispatchConsoleEvent: (state, action) => {
      const messages = [...action.event];
      return state.concat(messages).slice(-consoleMax);
    },
    clearConsole: (state, action) => []
  }
});

export const consoleActions = consoleSlice.actions;

export default consoleSlice.reducer;
