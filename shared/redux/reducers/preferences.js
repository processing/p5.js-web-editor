import * as ActionTypes from '../constants/constants';

const initialState = {
	isPreferencesShowing: false
}

const preferences = (state = initialState, action) => {
	switch (action.type) {
		case ActionTypes.OPEN_PREFERENCES:
			return {
				isPreferencesShowing: true
			}
		case ActionTypes.CLOSE_PREFERENCES:
			return {
				isPreferencesShowing: false
			}
		default:
			return state
	}
}

export default preferences;
