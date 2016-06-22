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
		case ActionTypes.START_SKETCH:
			return {
				isPlaying: true
			}
		case ActionTypes.STOP_SKETCH: 
			return {
				isPlaying: false
			}
		default:
			return state
	}
}

export default ide;