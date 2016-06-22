import * as ActionTypes from '../../../constants';

const initialState = {
	isVisible: false,
	fontSize: 18
}

const preferences = (state = initialState, action) => {
	switch (action.type) {
		case ActionTypes.OPEN_PREFERENCES:
			return {
				isVisible: true,
				fontSize: state.fontSize
			}
		case ActionTypes.CLOSE_PREFERENCES:
			return {
				isVisible: false,
				fontSize: state.fontSize
			}
		case ActionTypes.INCREASE_FONTSIZE:
			return {
				isVisible: state.isVisible,
				fontSize: state.fontSize+2
			}
		case ActionTypes.DECREASE_FONTSIZE:
			return {
				isVisible: state.isVisible,
				fontSize: state.fontSize-2
			}
		default:
			return state
	}
}

export default preferences;