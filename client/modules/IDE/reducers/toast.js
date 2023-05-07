import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isVisible: false,
  text: ''
};

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    setToast: (state, action) => {
      state.isVisible = true;
      state.text = action.payload;
    },
    hideToast: (state) => {
      state.isVisible = false;
    }
  }
});

export const { setToast, hideToast } = toastSlice.actions;

export default toastSlice.reducer;
