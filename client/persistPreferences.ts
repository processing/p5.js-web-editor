import type { PreferencesState } from './modules/IDE/reducers/preferences';

/*
  Editor preferences persist across browser sessions in localStorage. They used
  to be synced to the server for logged-in users, but the editor no longer has
  that endpoint after the OpenProcessing migration — preferences are now purely
  a local, per-browser concern (for guests and signed-in users alike).
*/
const key = 'p5-editor-preferences';

export const savePreferences = (preferences: PreferencesState) => {
  try {
    // tabIndex is transient UI state (which preferences pane tab is open) and
    // should not be persisted.
    const { tabIndex, ...persisted } = preferences;
    localStorage.setItem(key, JSON.stringify(persisted));
  } catch (error) {
    console.warn('Unable to persist preferences to localStorage:', error);
  }
};

export const loadPreferences = (): Partial<PreferencesState> | null => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    return JSON.parse(stored) as Partial<PreferencesState>;
  } catch (error) {
    console.warn('Failed to read preferences from localStorage:', error);
    return null;
  }
};
