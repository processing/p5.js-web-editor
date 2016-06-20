import { combineReducers } from 'redux'
import file from './files'
import ide from './ide'
import preferences from './preferences'

const rootReducer = combineReducers({
	file,
	ide,
	preferences
})

export default rootReducer
