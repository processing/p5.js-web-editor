import * as ActionTypes from '../constants/constants';

const initialState = {
	name: "sketch.js",
	content: "setup() { } draw() { }"
}

const file = (state = initialState, action) => {
	switch (action.type) {
		case ActionTypes.CHANGE_SELECTED_FILE:
			return {
				name: action.name,
				content: action.content
			}
		default:
			return state
	}
}

export default file;

//i'll add this in when there are multiple files
// const files = (state = [], action) => {
// 	switch (action.type) {
// 		case ActionTypes.CHANGE_SELECTED_FILE:
// 			//find the file with the name
// 			//update it
// 			//put in into the new array of files
// 		default:
// 			return state
// 	}
// }

// export default files