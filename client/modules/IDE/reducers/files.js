import * as ActionTypes from '../../../constants';

const initialState = {
  name: 'sketch.js',
  content: `function setup() { 
  createCanvas(400, 400);
} 

function draw() { 
  background(220);
}`
};

const file = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.CHANGE_SELECTED_FILE:
      return {
        name: action.name,
        content: action.content
      };
    case ActionTypes.NEW_PROJECT:
      return {
        name: action.file.name,
        content: action.file.content
      };
    case ActionTypes.SET_PROJECT:
      return {
        name: action.file.name,
        content: action.file.content
      };
    default:
      return state;
  }
};

export default file;

// i'll add this in when there are multiple files
// const files = (state = [], action) => {
//  switch (action.type) {
//    case ActionTypes.CHANGE_SELECTED_FILE:
//      //find the file with the name
//      //update it
//      //put in into the new array of files
//    default:
//      return state
//  }
// }

// export default files
