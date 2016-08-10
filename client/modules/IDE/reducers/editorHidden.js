import * as ActionTypes from '../../../constants';

const initialState = {
  enableBeep: false
};

const editorHidden = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.TOGGLE_BEEP:
      return Object.assign({}, state, { enableBeep: !state.enableBeep }); 
    default:
      return state;
  }
};

export default editorHidden;
