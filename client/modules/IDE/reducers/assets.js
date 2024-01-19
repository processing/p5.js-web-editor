import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  list: [],
  totalSize: 0
};

const assetsSlice = createSlice({
  name: 'assets',
  initialState,
  reducers: {
    setAssets: (state, action) => {
      state.list = action.payload.assets;
      state.totalSize = action.payload.totalSize;
    },
    deleteAsset: (state, action) => {
      const key = action.payload;
      const index = state.list.findIndex((asset) => asset.key === key);
      if (index !== -1) {
        const asset = state.list[index];
        state.totalSize -= asset.size;
        state.list.splice(index, 1);
      }
    }
  }
});

export const assetsActions = assetsSlice.actions;

export default assetsSlice.reducer;
