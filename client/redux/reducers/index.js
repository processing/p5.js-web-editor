import { combineReducers } from 'redux'
import file from './files'
import ide from './ide'
import preferences from './preferences'
import user from './user'
import project from './project'
import { reducer as form } from 'redux-form'

const rootReducer = combineReducers({
	form,
	file,
	ide,
	preferences,
	user,
	project
})

export default rootReducer
