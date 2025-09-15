import { createSlice } from '@reduxjs/toolkit';

const loadingSlice = createSlice({
  name: 'loading',
  initialState: {
    isLoading: false,
    error: null
  },
  reducers: {
    startLoader: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    stopLoader: (state) => {
      state.isLoading = false;
    },
    setError: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const {
  startLoader,
  stopLoader,
  setError,
  clearError
} = loadingSlice.actions;
export default loadingSlice.reducer;
