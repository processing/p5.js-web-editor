import { Route, IndexRoute } from 'react-router';
import React from 'react';
import App from './modules/App/App';
import IDEView from './modules/IDE/pages/IDEView';
import LoginView from './modules/User/pages/LoginView';
import SignupView from './modules/User/pages/SignupView';
// import SketchListView from './modules/Sketch/pages/SketchListView';
import { getUser } from './modules/User/actions';

const checkAuth = (store) => {
  store.dispatch(getUser());
};

const routes = (store) =>
  (
  <Route path="/" component={App}>
    <IndexRoute component={IDEView} onEnter={checkAuth(store)} />
    <Route path="/login" component={LoginView} />
    <Route path="/signup" component={SignupView} />
    <Route path="/projects/:project_id" component={IDEView} />
    <Route path="/sketches" component={IDEView} />
    <Route path="/:username/sketches" component={IDEView} />
  </Route>
  );

export default routes;
