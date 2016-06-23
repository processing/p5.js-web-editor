import { combineReducers } from 'redux';
import file from './modules/IDE/reducers/files';
import ide from './modules/IDE/reducers/ide';
import preferences from './modules/IDE/reducers/preferences';
import project from './modules/IDE/reducers/project';
import user from './modules/User/reducers';
import { reducer as form } from 'redux-form';

const rootReducer = combineReducers({
  form,
  ide,
  file,
  preferences,
  user,
  project
});

export default rootReducer;
