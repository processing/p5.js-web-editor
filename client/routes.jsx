import { Route, IndexRoute } from 'react-router';
import React from 'react';
import forceProtocol, { protocols, findSourceProtocol } from './components/forceProtocol';
import App from './modules/App/App';
import IDEView from './modules/IDE/pages/IDEView';
import FullView from './modules/IDE/pages/FullView';
import LoginView from './modules/User/pages/LoginView';
import SignupView from './modules/User/pages/SignupView';
import ResetPasswordView from './modules/User/pages/ResetPasswordView';
import EmailVerificationView from './modules/User/pages/EmailVerificationView';
import NewPasswordView from './modules/User/pages/NewPasswordView';
import AccountView from './modules/User/pages/AccountView';
// import SketchListView from './modules/Sketch/pages/SketchListView';
import { getUser } from './modules/User/actions';
import { stopSketch } from './modules/IDE/actions/ide';

const checkAuth = (store) => {
  store.dispatch(getUser());
};

const onRouteChange = (store) => {
  store.dispatch(stopSketch());
};

const routes = (store) => {
  const sourceProtocol = findSourceProtocol(store.getState());

  // If the flag is false, we stay on HTTP
  const forceToHttps = forceProtocol({
    targetProtocol: protocols.https,
    sourceProtocol,
    // prints debugging but does not reload page
    disable: process.env.FORCE_TO_HTTPS === false,
  });

  return (
    <Route path="/" component={App} onChange={() => { onRouteChange(store); }}>
      <IndexRoute component={IDEView} onEnter={checkAuth(store)} />
      <Route path="/login" component={forceToHttps(LoginView)} />
      <Route path="/signup" component={forceToHttps(SignupView)} />
      <Route path="/reset-password" component={forceToHttps(ResetPasswordView)} />
      <Route path="/verify" component={forceToHttps(EmailVerificationView)} />
      <Route
        path="/reset-password/:reset_password_token"
        component={forceToHttps(NewPasswordView)}
      />
      <Route path="/projects/:project_id" component={IDEView} />
      <Route path="/full/:project_id" component={FullView} />
      <Route path="/sketches" component={IDEView} />
      <Route path="/:username/sketches/:project_id" component={IDEView} />
      <Route path="/:username/sketches" component={IDEView} />
      <Route path="/:username/assets" component={IDEView} />
      <Route path="/:username/account" component={forceToHttps(AccountView)} />
      <Route path="/about" component={IDEView} />
      <Route path="/feedback" component={IDEView} />
    </Route>
  );
};

export default routes;
