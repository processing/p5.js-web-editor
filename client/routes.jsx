import { Route, IndexRoute } from 'react-router';
import React from 'react';
import App from './modules/App/App';
import IDEView from './modules/IDE/pages/IDEView';
import FullView from './modules/IDE/pages/FullView';
import LoginView from './modules/User/pages/LoginView';
import SignupView from './modules/User/pages/SignupView';
import ResetPasswordView from './modules/User/pages/ResetPasswordView';
import EmailVerificationView from './modules/User/pages/EmailVerificationView';
import NewPasswordView from './modules/User/pages/NewPasswordView';
import AccountView from './modules/User/pages/AccountView';
import CollectionView from './modules/User/pages/CollectionView';
import DashboardView from './modules/User/pages/DashboardView';
import createRedirectWithUsername from './components/createRedirectWithUsername';
import { getUser } from './modules/User/actions';
import { stopSketch } from './modules/IDE/actions/ide';
import { userIsAuthenticated, userIsNotAuthenticated, userIsAuthorized } from './utils/auth';

const checkAuth = (store) => {
  store.dispatch(getUser());
};

const onRouteChange = (store) => {
  store.dispatch(stopSketch());
};

const routes = store => (
  <Route path="/" component={App} onChange={() => { onRouteChange(store); }}>
    <IndexRoute component={IDEView} onEnter={checkAuth(store)} />
    <Route path="/login" component={userIsNotAuthenticated(LoginView)} />
    <Route path="/signup" component={userIsNotAuthenticated(SignupView)} />
    <Route path="/reset-password" component={userIsNotAuthenticated(ResetPasswordView)} />
    <Route path="/verify" component={EmailVerificationView} />
    <Route
      path="/reset-password/:reset_password_token"
      component={NewPasswordView}
    />
    <Route path="/projects/:project_id" component={IDEView} />
    <Route path="/:username/full/:project_id" component={FullView} />
    <Route path="/full/:project_id" component={FullView} />
    <Route path="/sketches" component={createRedirectWithUsername('/:username/sketches')} />
    <Route path="/:username/assets" component={userIsAuthenticated(userIsAuthorized(DashboardView))} />
    <Route path="/assets" component={createRedirectWithUsername('/:username/assets')} />
    <Route path="/account" component={userIsAuthenticated(AccountView)} />
    <Route path="/:username/sketches/:project_id" component={IDEView} />
    <Route path="/:username/sketches/:project_id/add-to-collection" component={IDEView} />
    <Route path="/:username/sketches" component={DashboardView} />
    <Route path="/:username/collections" component={DashboardView} />
    <Route path="/:username/collections/create" component={DashboardView} />
    <Route path="/:username/collections/:collection_id" component={CollectionView} />
    <Route path="/about" component={IDEView} />
  </Route>
);

export default routes;
