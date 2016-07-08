import * as ActionTypes from '../../../constants';

const defaultSketch = `function setup() { 
  createCanvas(400, 400);
} 

function draw() { 
  background(220);
}`;

const defaultHTML =
`
<!DOCTYPE html>
<html>
  <head>
  </head>
  <body>
    <script src="sketch.js"></script>
  </body>
</html>
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
    case ActionTypes.NEW_PROJECT:
      return [...action.files];
    case ActionTypes.SET_PROJECT:
      return [...action.files];
    default:
      return state;
  }
};

export const getFile = (state, id) => state.filter(file => file.id === id)[0];

export default files;
