import * as ActionTypes from '../constants/constants';

const initialState = {
	isPreferencesShowing: false,
	fontSize: 18
}

const preferences = (state = initialState, action) => {
	switch (action.type) {
		case ActionTypes.OPEN_PREFERENCES:
			return {
				isPreferencesShowing: true,
				fontSize: state.fontSize
			}
		case ActionTypes.CLOSE_PREFERENCES:
			return {
				isPreferencesShowing: false,
				fontSize: state.fontSize
			}
		case ActionTypes.INCREASE_FONTSIZE:
			return {
				isPreferencesShowing: state.isPreferencesShowing,
				fontSize: state.fontSize+2
			}
		case ActionTypes.DECREASE_FONTSIZE:
			return {
				isPreferencesShowing: state.isPreferencesShowing,
				fontSize: state.fontSize-2
			}
		default:
			return state
	}
}

export default preferences;
