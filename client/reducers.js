import { combineReducers } from 'redux';
import files from './modules/IDE/reducers/files';
import ide from './modules/IDE/reducers/ide';
import preferences from './modules/IDE/reducers/preferences';
import project from './modules/IDE/reducers/project';
import editorAccessibility from './modules/IDE/reducers/editorAccessibility';
import user from './modules/User/reducers';
import sketches from './modules/IDE/reducers/projects';
import toast from './modules/IDE/reducers/toast';
import console from './modules/IDE/reducers/console';
import assets from './modules/IDE/reducers/assets';
import search from './modules/IDE/reducers/search';
import sorting from './modules/IDE/reducers/sorting';
import loading from './modules/IDE/reducers/loading';
import collections from './modules/IDE/reducers/collections';

const rootReducer = combineReducers({
  ide,
  files,
  preferences,
  user,
  project,
  sketches,
  search,
  sorting,
  editorAccessibility,
  toast,
  console,
  assets,
  loading,
  collections
});

export default rootReducer;
