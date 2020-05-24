import * as ActionTypes from '../../../constants';
import { generateProjectName } from '../../../utils/generateRandomName';

const initialState = () => {
  const generatedString = generateProjectName();
  const generatedName = generatedString.charAt(0).toUpperCase() + generatedString.slice(1);
  return {
    name: generatedName,
    updatedAt: '',
    isSaving: false,
    isPrivate: false // initialize sketch privacy state to false
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
        isSaving: false,
        isPrivate: false
      };
    case ActionTypes.SET_PROJECT:
      return {
        id: action.project.id,
        name: action.project.name,
        updatedAt: action.project.updatedAt,
        owner: action.owner,
        isSaving: false,
        isPrivate: action.project.isPrivate
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
    case ActionTypes.END_SAVING_PROJECT:
      return Object.assign({}, state, { isSaving: false });
    case ActionTypes.SET_IS_PRIVATE_OUTPUT:
      return Object.assign({}, state, { isPrivate: action.value });
    default:
      return state;
  }
};

export default project;
