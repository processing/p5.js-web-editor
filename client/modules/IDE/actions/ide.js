import * as ActionTypes from '../../../constants';

export function toggleSketch() {
  return {
    type: ActionTypes.TOGGLE_SKETCH
  };
}

export function startSketch() {
  return {
    type: ActionTypes.START_SKETCH
  };
}

export function stopSketch() {
  return {
    type: ActionTypes.STOP_SKETCH
  };
}
