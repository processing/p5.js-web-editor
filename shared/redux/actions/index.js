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

export function startSketch() {
	return {
		type: ActionTypes.START_SKETCH
	}
}

export function stopSketch() {
	return {
		type: ActionTypes.STOP_SKETCH
	}
}

export function openPreferences() {
	return {
		type: ActionTypes.OPEN_PREFERENCES
	}
}

export function closePreferences() {
	return {
		type: ActionTypes.CLOSE_PREFERENCES
	}
}
