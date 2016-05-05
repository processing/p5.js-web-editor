import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import configureStore from '../shared/redux/store/configureStore'
import App from '../shared/containers/App/App'

const initialState = window.__INITIAL_STATE__
const store = configureStore(initialState)

render(
	<Provider store={store}>
		<App/>
	</Provider>,
	document.getElementById('root')
)