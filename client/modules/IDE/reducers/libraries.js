import * as ActionTypes from '../../../constants';

export const initialState = [
  {
    name: 'p5.js',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.9.0/p5.js',
  },
  {
    name: 'p5.dom.js',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.9.0/addons/p5.dom.min.js'
  },
  {
    name: 'p5.sound.js',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.9.0/addons/p5.sound.min.js'
  }
];

const libraries = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.ADD_LIBRARY:
      return state.concat(action.library);
    default:
      return state;
  }
};

export default libraries;
