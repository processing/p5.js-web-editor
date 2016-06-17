import * as ActionTypes from '../constants/constants';
import axios from 'axios'

const ROOT_URL = location.href.indexOf('localhost') > 0 ? 'http://localhost:8000' : '/';

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

export function increaseFont() {
	return {
		type: ActionTypes.INCREASE_FONTSIZE
	}
}

export function decreaseFont() {
	return {
		type: ActionTypes.DECREASE_FONTSIZE
	}
}

export function saveProject() {
	// return function(dispatch) {
	// 	let projectValues = {};
	// 	axios.put(`${ROOT_URL}/projects`, projectValues, {withCredentials: true})
	// 		.then(response => {
	// 			dispatch({
	// 				type: ActionTypes.PROJECT_SAVE_SUCCESS
	// 			});
	// 		})
	// 		.catch(response => dispatch({
	// 			type: ActionTypes.PROJECT_SAVE_FAIL
	// 		}));
	// }
	return function(dispatch) {

	}
}


export function createProject() {
	return function(dispatch) {
		axios.post(`${ROOT_URL}/projects`, {}, {withCredentials: true})
			.then(response => {
				dispatch({
					type: ActionTypes.NEW_PROJECT,
					name: response.data.name
				});
			})
			.catch(response => dispatch({
				type: ActionTypes.PROJECT_SAVE_FAIL
			}));
	}
}
