import * as ActionTypes from '../constants/constants';

const initialState = {
	isPreferencesShowing: false
}

const preferences = (state = initialState, action) => {
	switch (action.type) {
		case ActionTypes.TOGGLE_PREFERENCES:
			return {
				isPreferencesShowing: !state.isPreferencesShowing
			}
		default:
			return state
	}
}

export default preferences;
