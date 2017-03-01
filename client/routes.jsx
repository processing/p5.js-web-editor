import { Route, IndexRoute } from 'react-router';
import React from 'react';
import App from './modules/App/App';
import IDEView from './modules/IDE/pages/IDEView';
import FullView from './modules/IDE/pages/FullView';
import LoginView from './modules/User/pages/LoginView';
import SignupView from './modules/User/pages/SignupView';
import ResetPasswordView from './modules/User/pages/ResetPasswordView';
import NewPasswordView from './modules/User/pages/NewPasswordView';
// import SketchListView from './modules/Sketch/pages/SketchListView';
import { getUser } from './modules/User/actions';

// TODO: Move somewhere else
import forceProtocol from './forceProtocol';

const forceToHttps = forceProtocol({ targetProtocol: 'https:' });

const checkAuth = (store) => {
  store.dispatch(getUser());
};

const routes = store =>
  (
    <Route path="/" component={App}>
      <IndexRoute component={IDEView} onEnter={checkAuth(store)} />
      <Route path="/login" component={forceToHttps(LoginView)} />
      <Route path="/signup" component={SignupView} />
      <Route path="/reset-password" component={ResetPasswordView} />
      <Route path="/reset-password/:reset_password_token" component={NewPasswordView} />
      <Route path="/projects/:project_id" component={IDEView} />
      <Route path="/full/:project_id" component={FullView} />
      <Route path="/sketches" component={IDEView} />
      <Route path="/:username/sketches/:project_id" component={IDEView} />
      <Route path="/:username/sketches" component={IDEView} />
      <Route path="/about" component={IDEView} />
    </Route>
  );

export default routes;
