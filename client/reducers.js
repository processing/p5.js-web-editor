import { combineReducers } from 'redux';
import files from './modules/IDE/reducers/files';
import ide from './modules/IDE/reducers/ide';
import preferences from './modules/IDE/reducers/preferences';
import project from './modules/IDE/reducers/project';
import editorAccessibility from './modules/IDE/reducers/editorAccessibility';
import user from './modules/User/reducers';
import sketches from './modules/IDE/reducers/projects';
import toast from './modules/IDE/reducers/toast';
import { reducer as form } from 'redux-form';

const rootReducer = combineReducers({
  form,
  ide,
  files,
  preferences,
  user,
  project,
  sketches,
  editorAccessibility,
  toast
});

export default rootReducer;
