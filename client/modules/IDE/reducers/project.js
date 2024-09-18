import { createSlice } from '@reduxjs/toolkit';
import { generateProjectName } from '../../../utils/generateRandomName';

const generateInitialState = () => {
  const generatedString = generateProjectName();
  const generatedName =
    generatedString.charAt(0).toUpperCase() + generatedString.slice(1);
  return {
    name: generatedName,
    updatedAt: '',
    isSaving: false
  };
};

const initialState = generateInitialState();

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setProjectName(state, action) {
      state.name = action.payload;
    },
    newProject(state, action) {
      const { id, name, updatedAt, owner } = action.payload;
      state.id = id;
      state.name = name;
      state.updatedAt = updatedAt;
      state.owner = owner;
      state.isSaving = false;
    },
    setProject(state, action) {
      const { id, name, updatedAt, owner } = action.payload;
      state.id = id;
      state.name = name;
      state.updatedAt = updatedAt;
      state.owner = owner;
      state.isSaving = false;
    },
    resetProject(state) {
      Object.assign(state, initialState);
    },
    setProjectSavedTime(state, action) {
      state.updatedAt = action.payload;
    },
    startSavingProject(state) {
      state.isSaving = true;
    },
    endSavingProject(state) {
      state.isSaving = false;
    }
  }
});

export const {
  setProjectName,
  newProject,
  setProject,
  resetProject,
  setProjectSavedTime,
  startSavingProject,
  endSavingProject
} = projectSlice.actions;

export default projectSlice.reducer;
