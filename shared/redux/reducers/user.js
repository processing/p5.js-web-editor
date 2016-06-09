import * as ActionTypes from '../constants/constants'

const user = (state = {}, action) => {
	switch (action.type) {
		case ActionTypes.AUTH_USER:
			return { ...state, error: '', authenticated: true };
		default:
			return state;
	}
}

export default user;