import * as ActionTypes from '../../../constants';

const initialState = {
  name: 'Hello p5.js'
};

const project = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.SET_PROJECT_NAME:
      return {
        name: action.name
      };
    case ActionTypes.NEW_PROJECT:
      return {
        id: action.id,
        name: action.name
      };
    case ActionTypes.SET_PROJECT:
      return {
        id: action.project.id,
        name: action.project.name,
        file: {
          name: action.project.file.name,
          content: action.project.file.content
        }
      };
    default:
      return state;
  }
};

export default project;
