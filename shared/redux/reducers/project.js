import * as ActionTypes from '../constants/constants';

const initialState = {
	name: "Hello p5.js"
}

const project = (state = initialState, action) => {
	switch (action.type) {
		case ActionTypes.SET_PROJECT_NAME:
			return {
				name: action.name
			}
		case ActionTypes.NEW_PROJECT:
			return {
				name: action.name
			}
		default:
			return state;
	}
}

export default project;