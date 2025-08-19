import { createSlice } from '@reduxjs/toolkit';

const sketchesSlice = createSlice({
  name: 'sketches',
  initialState: [],
  reducers: {
    setProjects(state, action) {
      return action.payload;
    },
    deleteProject(state, action) {
      return state.filter((sketch) => sketch.id !== action.payload.id);
    },
    renameProject(state, action) {
      const { id, name } = action.payload;
      return state.map((sketch) =>
        sketch.id === id ? { ...sketch, name } : { ...sketch }
      );
    }
  }
});

export const {
  setProjects,
  deleteProject,
  renameProject
} = sketchesSlice.actions;

export default sketchesSlice.reducer;
