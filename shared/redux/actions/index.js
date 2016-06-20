import * as ActionTypes from '../constants/constants';
import axios from 'axios'

const ROOT_URL = location.href.indexOf('localhost') > 0 ? 'http://localhost:8000/api' : '/api';

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
