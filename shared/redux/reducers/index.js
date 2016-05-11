import { combineReducers } from 'redux'
import file from './files'
import ide from './ide'

const rootReducer = combineReducers({
	file,
	ide
})

export default rootReducer