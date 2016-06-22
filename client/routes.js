import { Route, IndexRoute } from 'react-router'
import React from 'react'
import App from './modules/App/App'
import IDEView from './modules/IDE/pages/IDEView'
import LoginView from './modules/Auth/pages/LoginView'
import SignupView from './modules/Auth/pages/SignupView'
import { getUser } from './redux/actions/user'

const routes = (store) => {
	return (
		<Route path="/" component={App}>
			<IndexRoute component={IDEView} onEnter={checkAuth(store)}/>
			<Route path="/login" component={LoginView}/>
			<Route path="/signup" component={SignupView}/>
			<Route path="/projects/:project_id" component={IDEView}/>
		</Route>
	);
}

const checkAuth = (store) => {
	store.dispatch(getUser());
}

export default routes;