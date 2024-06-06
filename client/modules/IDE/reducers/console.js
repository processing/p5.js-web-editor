import { createSlice } from '@reduxjs/toolkit';

const consoleMax = 5000;
const initialState = [];

const consoleSlice = createSlice({
  name: 'console',
  initialState,
  reducers: {
    dispatchConsoleEvent: (state, action) => {
      const messages = [...action.payload];
      return state.concat(messages).slice(-consoleMax);
    },
    clearConsole: () => []
  }
});

export const { dispatchConsoleEvent, clearConsole } = consoleSlice.actions;
export default consoleSlice.reducer;
