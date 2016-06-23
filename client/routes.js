import { Route, IndexRoute } from 'react-router';
import React from 'react';
import App from './modules/App/App';
import IDEView from './modules/IDE/pages/IDEView';
import LoginView from './modules/User/pages/LoginView';
import SignupView from './modules/User/pages/SignupView';
import { getUser } from './modules/User/actions';

const checkAuth = (store) => {
  store.dispatch(getUser());
};

const routes = (store) => {
  return (
    <Route path="/" component={App}>
      <IndexRoute component={IDEView} onEnter={checkAuth(store)} />
      <Route path="/login" component={LoginView} />
      <Route path="/signup" component={SignupView} />
      <Route path="/projects/:project_id" component={IDEView} />
    </Route>
  );
};

export default routes;
