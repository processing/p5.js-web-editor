import type { RootState } from './reducers';
/*
  Saves and loads a snapshot of the Redux store
  state to session storage
*/
const key = 'p5js-editor';
const storage = sessionStorage;

export const saveState = (state: RootState) => {
  try {
    storage.setItem(key, JSON.stringify(state));
  } catch (error) {
    console.warn('Unable to persist state to storage:', error);
  }
};

export const loadState = () => {
  try {
    const stored = storage.getItem(key);
    if (!stored) return null; // handle null before parsing
    return JSON.parse(stored) as RootState;
  } catch (error) {
    console.warn('Failed to retrieve initialize state from storage:', error);
    return null;
  }
};

export const clearState = () => {
  storage.removeItem(key);
};
