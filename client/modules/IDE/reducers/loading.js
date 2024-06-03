import { createSlice } from '@reduxjs/toolkit';

const loadingSlice = createSlice({
  name: 'loading',
  initialState: false,
  reducers: {
    startLoader: () => true,
    stopLoader: () => false
  }
});

export const { startLoader, stopLoader } = loadingSlice.actions;
export default loadingSlice.reducer;
