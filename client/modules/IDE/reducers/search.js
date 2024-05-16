import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  collectionSearchTerm: '',
  sketchSearchTerm: ''
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchTerm: (state, action) => {
      const { scope, query } = action.payload;
      return {
        ...state,
        [`${scope}SearchTerm`]: query
      };
    }
  }
});

export const { setSearchTerm } = searchSlice.actions;

export default searchSlice.reducer;
