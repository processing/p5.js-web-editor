import { combineReducers } from 'redux';
import { reducer as form } from 'redux-form';
import files from './modules/IDE/reducers/files';
import ide from './modules/IDE/reducers/ide';
import preferences from './modules/IDE/reducers/preferences';
import project from './modules/IDE/reducers/project';
import classrooms from './modules/IDE/reducers/classrooms';
import classroom from './modules/IDE/reducers/classroom';
import assignment from './modules/IDE/reducers/assignment';
import editorAccessibility from './modules/IDE/reducers/editorAccessibility';
import user from './modules/User/reducers';
import sketches from './modules/IDE/reducers/projects';
import toast from './modules/IDE/reducers/toast';
import console from './modules/IDE/reducers/console';
import assets from './modules/IDE/reducers/assets';

const rootReducer = combineReducers({
  form,
  ide,
  files,
  preferences,
  user,
  project,
  sketches,
  classrooms,
  classroom,
  assignment,
  editorAccessibility,
  toast,
  console,
  assets
});

export default rootReducer;
