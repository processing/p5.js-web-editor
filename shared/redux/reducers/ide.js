import * as ActionTypes from '../constants/constants';

const initialState = {
	isPlaying: false	
}

const ide = (state = initialState, action) => {
	switch (action.type) {
		case ActionTypes.TOGGLE_SKETCH:
			return {
				isPlaying: !state.isPlaying
			}
		default:
			return state
	}
}

export default ide;