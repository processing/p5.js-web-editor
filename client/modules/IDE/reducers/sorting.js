import { createSlice } from '@reduxjs/toolkit';
import { DIRECTION } from '../actions/sorting';

const initialState = {
  field: 'createdAt',
  direction: DIRECTION.DESC
};

const sortingSlice = createSlice({
  name: 'sorting',
  initialState,
  reducers: {
    toggleDirectionForField: (state, action) => {
      const { field } = action.payload;
      if (field && field !== state.field) {
        const direction = field === 'name' ? DIRECTION.ASC : DIRECTION.DESC;
        return { ...state, field, direction };
      }
      const direction =
        state.direction === DIRECTION.ASC ? DIRECTION.DESC : DIRECTION.ASC;
      return { ...state, direction };
    },
    setSorting: (state, action) => {
      const { field, direction } = action.payload;
      return { ...state, field, direction };
    }
  }
});

export const { toggleDirectionForField, setSorting } = sortingSlice.actions;

export default sortingSlice.reducer;
