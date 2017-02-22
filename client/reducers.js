import { combineReducers } from 'redux';
import { reducer as form } from 'redux-form';
import files from './modules/IDE/reducers/files';
import ide from './modules/IDE/reducers/ide';
import preferences from './modules/IDE/reducers/preferences';
import project from './modules/IDE/reducers/project';
import editorAccessibility from './modules/IDE/reducers/editorAccessibility';
import user from './modules/User/reducers';
import sketches from './modules/IDE/reducers/projects';
import toast from './modules/IDE/reducers/toast';
import console from './modules/IDE/reducers/console';

const rootReducer = combineReducers({
  form,
  ide,
  files,
  preferences,
  user,
  project,
  sketches,
  editorAccessibility,
  toast,
  console
});

export default rootReducer;
