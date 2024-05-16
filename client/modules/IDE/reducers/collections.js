import { createSlice } from '@reduxjs/toolkit';

const sketchesSlice = createSlice({
  name: 'sketches',
  initialState: [],
  reducers: {
    setCollections: (state, action) => action.payload,
    delCollection: (state, action) => {
      const { collectionId } = action.payload;
      return state.filter((collection) => collection.id !== collectionId);
    },
    updateCollection: (state, action) => {
      const updatedCollection = action.payload;
      return state.map((collection) =>
        collection.id === updatedCollection.id ? updatedCollection : collection
      );
    }
  }
});

export const {
  setCollections,
  delCollection,
  updateCollection
} = sketchesSlice.actions;

export default sketchesSlice.reducer;
