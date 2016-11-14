import { Route, IndexRoute, Redirect } from 'react-router';
import React from 'react';
import App from './modules/App/App';
import IDEView from './modules/IDE/pages/IDEView';
import FullView from './modules/IDE/pages/FullView';
// import SketchListView from './modules/Sketch/pages/SketchListView';
import { getUser } from './modules/User/actions';

const checkAuth = (store) => {
  store.dispatch(getUser());
};

const routes = (store) =>
  (
  <Route path="/" component={App}>
    <IndexRoute component={IDEView} onEnter={checkAuth(store)} />
    <Route path="/login" component={IDEView} />
    <Route path="/signup" component={IDEView} />
    <Route path="/reset-password" component={IDEView} />
    <Route path="/reset-password/:reset_password_token" component={IDEView} />
    <Route path="/projects/:project_id" component={IDEView} />
    <Route path="/full/:project_id" component={FullView} />
    <Route path="/sketches" component={IDEView} />
    <Route path="/:username/sketches" component={IDEView} />
    <Route path="/about" component={IDEView} />
    <Redirect from="*" to="/" />
  </Route>
  );

export default routes;
