import friendlyWords from 'friendly-words';
import * as ActionTypes from '../../../constants';

const generateRandomName = () => {
  const adj = friendlyWords.predicates[Math.floor(Math.random() * friendlyWords.predicates.length)];
  const obj = friendlyWords.objects[Math.floor(Math.random() * friendlyWords.objects.length)];
  return `${adj} ${obj}`;
};

const initialState = () => {
  const generatedString = generateRandomName();
  const generatedName = generatedString.charAt(0).toUpperCase() + generatedString.slice(1);
  return {
    name: generatedName,
    updatedAt: '',
    isSaving: false
  };
};

const project = (state, action) => {
  if (state === undefined) {
    state = initialState(); // eslint-disable-line
  }
  switch (action.type) {
    case ActionTypes.SET_PROJECT_NAME:
      return Object.assign({}, { ...state }, { name: action.name });
    case ActionTypes.NEW_PROJECT:
      return {
        id: action.project.id,
        name: action.project.name,
        updatedAt: action.project.updatedAt,
        owner: action.owner,
        isSaving: false
      };
    case ActionTypes.SET_PROJECT:
      return {
        id: action.project.id,
        name: action.project.name,
        updatedAt: action.project.updatedAt,
        owner: action.owner,
        isSaving: false
      };
    case ActionTypes.RESET_PROJECT:
      return initialState();
    case ActionTypes.SHOW_EDIT_PROJECT_NAME:
      return Object.assign({}, state, { isEditingName: true });
    case ActionTypes.HIDE_EDIT_PROJECT_NAME:
      return Object.assign({}, state, { isEditingName: false });
    case ActionTypes.SET_PROJECT_SAVED_TIME:
      return Object.assign({}, state, { updatedAt: action.value });
    case ActionTypes.START_SAVING_PROJECT:
      return Object.assign({}, state, { isSaving: true });
    case ActionTypes.START_STOP_PROJECT:
      return Object.assign({}, state, { isSaving: false });
    default:
      return state;
  }
};

export default project;
