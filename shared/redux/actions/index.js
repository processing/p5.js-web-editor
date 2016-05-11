import * as ActionTypes from '../constants/constants';

export function updateFile(name, content) {
	return {
		type: ActionTypes.CHANGE_SELECTED_FILE,
		name: name,
		content: content
	}
}

export function toggleSketch() {
	return {
		type: ActionTypes.TOGGLE_SKETCH
	}
}