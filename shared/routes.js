import { Route, IndexRoute } from 'react-router'
import React from 'react'
import App from './containers/App'
import IDEView from './containers/IDEView/IDEView'
import LoginView from './containers/LoginView/LoginView'
import SignupView from './containers/SignupView/SignupView'

const routes = (
	<Route path="/" component={App}>
		<IndexRoute component={IDEView} />
		<Route path="/login" component={LoginView}/>
		<Route path="/signup" component={SignupView}/>
	</Route>
);

export default routes;