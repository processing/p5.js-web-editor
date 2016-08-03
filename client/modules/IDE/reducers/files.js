import * as ActionTypes from '../../../constants';

const defaultSketch = `function setup() { 
  createCanvas(400, 400);
} 

function draw() { 
  background(220);
}`;

const defaultHTML =
`<!DOCTYPE html>
<html>
  <head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.5.2/p5.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.5.2/addons/p5.dom.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.5.2/addons/p5.sound.min.js"></script>
    <link rel="stylesheet" type="text/css" href="style.css">
  </head>
  <body>
    <script src="sketch.js"></script>
  </body>
</html>
`;

const defaultCSS =
`html, body {
  overflow: hidden;
  margin: 0;
  padding: 0;
}
`;

// if the project has never been saved,
const initialState = [
  {
    name: 'sketch.js',
    content: defaultSketch,
    id: '1'
  },
  {
    name: 'index.html',
    content: defaultHTML,
    id: '2'
  },
  {
    name: 'style.css',
    content: defaultCSS,
    id: '3'
  }];


const files = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.UPDATE_FILE_CONTENT:
      return state.map(file => {
        if (file.name !== action.name) {
          return file;
        }

        return Object.assign({}, file, { content: action.content });
      });
    case ActionTypes.SET_BLOB_URL:
      return state.map(file => {
        if (file.name !== action.name) {
          return file;
        }
        return Object.assign({}, file, { blobURL: action.blobURL });
      });
    case ActionTypes.NEW_PROJECT:
      return [...action.files];
    case ActionTypes.SET_PROJECT:
      return [...action.files];
    case ActionTypes.CREATE_FILE:
      return [...state, { name: action.name, id: action.id, content: '', url: action.url }];
    case ActionTypes.SHOW_FILE_OPTIONS:
      return state.map(file => {
        if (file.id !== action.id) {
          return file;
        }

        return Object.assign({}, file, { isOptionsOpen: true });
      });
    case ActionTypes.HIDE_FILE_OPTIONS:
      return state.map(file => {
        if (file.id !== action.id) {
          return file;
        }

        return Object.assign({}, file, { isOptionsOpen: false });
      });
    case ActionTypes.UPDATE_FILE_NAME:
      return state.map(file => {
        if (file.id !== action.id) {
          return file;
        }

        return Object.assign({}, file, { name: action.name });
      });
    case ActionTypes.DELETE_FILE:
      return state.filter(file => file.id !== action.id);
    case ActionTypes.SHOW_EDIT_FILE_NAME:
      return state.map(file => {
        if (file.id !== action.id) {
          return file;
        }

        return Object.assign({}, file, { isEditingName: true });
      });
    case ActionTypes.HIDE_EDIT_FILE_NAME:
      return state.map(file => {
        if (file.id !== action.id) {
          return file;
        }

        return Object.assign({}, file, { isEditingName: false });
      });
    default:
      return state;
  }
};

export const setSelectedFile = (state, id) =>
  state.map(file => {
    if (file.id === id) {
      return Object.assign({}, file, { isSelected: true });
    }
    return file;
  });

export const getFile = (state, id) => state.filter(file => file.id === id)[0];
export const getHTMLFile = (state) => state.filter(file => file.name.match(/.*\.html$/))[0];
export const getJSFiles = (state) => state.filter(file => file.name.match(/.*\.js$/));
export const getCSSFiles = (state) => state.filter(file => file.name.match(/.*\.css$/));
export const getLinkedFiles = (state) => state.filter(file => file.url);

export default files;
