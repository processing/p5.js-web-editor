import { Route, IndexRoute } from 'react-router'
import React from 'react'
import App from './containers/App'
import IDEView from './containers/IDEView/IDEView'
import LoginView from './containers/LoginView/LoginView'
import SignupView from './containers/SignupView/SignupView'
import { getUser } from './redux/actions/user';

const routes = (store) => {
	return (
		<Route path="/" component={App}>
			<IndexRoute component={IDEView} onEnter={checkAuth(store)}/>
			<Route path="/login" component={LoginView}/>
			<Route path="/signup" component={SignupView}/>
		</Route>
	);
}

const checkAuth = (store) => {
	store.dispatch(getUser());
}

export default routes;