import { Route, IndexRoute } from 'react-router';
import React from 'react';

import App from './modules/App/App';
import IDEView from './modules/IDE/pages/IDEView';
import MobileIDEView from './modules/IDE/pages/MobileIDEView';
import MobileSketchView from './modules/Mobile/MobileSketchView';
import MobilePreferences from './modules/Mobile/MobilePreferences';
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
import MobileDashboardView from './modules/Mobile/MobileDashboardView';
// import PrivacyPolicy from './modules/IDE/pages/PrivacyPolicy';
// import TermsOfUse from './modules/IDE/pages/TermsOfUse';
import Legal from './modules/IDE/pages/Legal';
import { getUser } from './modules/User/actions';
import { stopSketch } from './modules/IDE/actions/ide';
import {
  userIsAuthenticated,
  userIsNotAuthenticated,
  userIsAuthorized
} from './utils/auth';
import { mobileFirst, responsiveForm } from './utils/responsive';

const checkAuth = (store) => {
  store.dispatch(getUser());
};

// TODO: This short-circuit seems unnecessary - using the mobile <Switch /> navigator (future) should prevent this from being called
const onRouteChange = (store) => {
  const path = window.location.pathname;
  if (path.includes('preview')) return;

  store.dispatch(stopSketch());
};

const routes = (store) => (
  <Route
    path="/"
    component={App}
    onChange={() => {
      onRouteChange(store);
    }}
  >
    <IndexRoute
      onEnter={checkAuth(store)}
      component={mobileFirst(MobileIDEView, IDEView)}
    />

    <Route
      path="/login"
      component={userIsNotAuthenticated(
        mobileFirst(responsiveForm(LoginView), LoginView)
      )}
    />
    <Route
      path="/signup"
      component={userIsNotAuthenticated(
        mobileFirst(responsiveForm(SignupView), SignupView)
      )}
    />
    <Route
      path="/reset-password"
      component={userIsNotAuthenticated(ResetPasswordView)}
    />
    <Route path="/verify" component={EmailVerificationView} />
    <Route
      path="/reset-password/:reset_password_token"
      component={NewPasswordView}
    />
    <Route path="/projects/:project_id" component={IDEView} />
    <Route path="/:username/full/:project_id" component={FullView} />
    <Route path="/full/:project_id" component={FullView} />

    <Route
      path="/:username/assets"
      component={userIsAuthenticated(
        userIsAuthorized(mobileFirst(MobileDashboardView, DashboardView))
      )}
    />
    <Route
      path="/:username/sketches"
      component={mobileFirst(MobileDashboardView, DashboardView)}
    />
    <Route
      path="/:username/sketches/:project_id"
      component={mobileFirst(MobileIDEView, IDEView)}
    />
    <Route
      path="/:username/sketches/:project_id/add-to-collection"
      component={mobileFirst(MobileIDEView, IDEView)}
    />
    <Route
      path="/:username/collections"
      component={mobileFirst(MobileDashboardView, DashboardView)}
    />
    <Route
      path="/:username/collections/:collection_id"
      component={CollectionView}
    />

    <Route
      path="/sketches"
      component={createRedirectWithUsername('/:username/sketches')}
    />
    <Route
      path="/assets"
      component={createRedirectWithUsername('/:username/assets')}
    />
    <Route path="/account" component={userIsAuthenticated(AccountView)} />
    <Route path="/about" component={IDEView} />

    {/* Mobile-only Routes */}
    <Route path="/preview" component={MobileSketchView} />
    <Route path="/preferences" component={MobilePreferences} />
    <Route path="/privacy-policy" component={Legal} />
    <Route path="/terms-of-use" component={Legal} />
    <Route path="/code-of-conduct" component={Legal} />
  </Route>
);

export default routes;
