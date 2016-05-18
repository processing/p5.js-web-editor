import { Route, IndexRoute } from 'react-router'
import React from 'react'
import App from './containers/App'
import IDEView from './containers/IDEView/IDEView'

const routes = (
	<Route path="/" component={App}>
		<IndexRoute component={IDEView} />
	</Route>
);

export default routes;