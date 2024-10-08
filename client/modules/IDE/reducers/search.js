import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  collectionSearchTerm: '',
  sketchSearchTerm: ''
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchTerm: {
      reducer: (state, action) => {
        const { scope, query } = action.payload;
        state[`${scope}SearchTerm`] = query;
      },
      prepare: (scope, query) => ({ payload: { scope, query } })
    }
  }
});

export const { setSearchTerm } = searchSlice.actions;

export default searchSlice.reducer;
