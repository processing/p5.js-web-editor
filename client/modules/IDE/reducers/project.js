import * as ActionTypes from '../../../constants';
const generate = require('project-name-generator');

const generatedName = generate({ words: 2 }).dashed;

const initialState = {
  name: `${generatedName}`
};

const project = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.SET_PROJECT_NAME:
      return Object.assign({}, { ...state }, { name: action.name });
    case ActionTypes.NEW_PROJECT:
      return {
        id: action.id,
        name: action.name,
        owner: action.owner
      };
    case ActionTypes.SET_PROJECT:
      return {
        id: action.project.id,
        name: action.project.name,
        owner: action.owner
      };
    case ActionTypes.RESET_PROJECT:
      return initialState;
    case ActionTypes.SHOW_EDIT_PROJECT_NAME:
      return Object.assign({}, state, { isEditingName: true });
    case ActionTypes.HIDE_EDIT_PROJECT_NAME:
      return Object.assign({}, state, { isEditingName: false });
    default:
      return state;
  }
};

export default project;
