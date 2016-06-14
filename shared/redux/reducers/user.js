import * as ActionTypes from '../constants/constants'

const user = (state = {authenticated: false}, action) => {
	switch (action.type) {
		case ActionTypes.AUTH_USER:
			return { ...action.user,
							authenticated: true };
		default:
			return state;
	}
}

export default user;