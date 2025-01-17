import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Route as RouterRoute, Switch } from 'react-router-dom';

import App from './modules/App/App';
import IDEView from './modules/IDE/pages/IDEView';
import FullView from './modules/IDE/pages/FullView';
import About from './modules/About/pages/About';
import CodeOfConduct from './modules/Legal/pages/CodeOfConduct';
import PrivacyPolicy from './modules/Legal/pages/PrivacyPolicy';
import TermsOfUse from './modules/Legal/pages/TermsOfUse';
import LoginView from './modules/User/pages/LoginView';
import SignupView from './modules/User/pages/SignupView';
import ResetPasswordView from './modules/User/pages/ResetPasswordView';
import EmailVerificationView from './modules/User/pages/EmailVerificationView';
import NewPasswordView from './modules/User/pages/NewPasswordView';
import AccountView from './modules/User/pages/AccountView';
import CollectionView from './modules/User/pages/CollectionView';
import DashboardView from './modules/User/pages/DashboardView';
import { getUser } from './modules/User/actions';

/**
 *  `params` is no longer a top-level route component prop in v4.
 *  It is a nested property of `match`.
 *  Use an HOC to lift it up to top-level.
 */
const withParams = (Component) => (props) => (
  // eslint-disable-next-line react/prop-types
  <Component {...props} params={props.match.params} />
);
/**
 * Instead of updating all individual components, use this plug-in Route replacement.
 * It passes the `params` as a top-level property
 * and fixes prop-types errors in react-router package
 * (Warning: Failed prop type: Invalid prop `component` of type `object` supplied to `Route`, expected `function`.)
 */
const Route = ({ component, ...props }) => (
  <RouterRoute component={withParams(component)} {...props} />
);
Route.propTypes = {
  ...RouterRoute.propTypes,
  component: PropTypes.elementType.isRequired
};

const routes = (
  <Switch>
    <Route exact path="/" component={IDEView} />
    <Route path="/login" component={LoginView} />
    <Route path="/signup" component={SignupView} />
    <Route
      path="/reset-password/:reset_password_token"
      component={NewPasswordView}
    />
    <Route path="/reset-password" component={ResetPasswordView} />
    <Route path="/verify" component={EmailVerificationView} />
    <Route path="/projects/:project_id" component={IDEView} />
    <Route path="/:username/full/:project_id" component={FullView} />
    <Route path="/full/:project_id" component={FullView} />

    <Route path="/:username/assets" component={DashboardView} />
    <Route
      path="/:username/sketches/:project_id/add-to-collection"
      component={IDEView}
    />
    <Route path="/:username/sketches/:project_id" component={IDEView} />
    <Route path="/:username/sketches" component={DashboardView} />
    <Route
      path="/:username/collections/:collection_id"
      component={CollectionView}
    />
    <Route path="/:username/collections" component={DashboardView} />
    <Route path="/sketches" component={DashboardView} />
    <Route path="/assets" component={DashboardView} />
    <Route path="/account" component={AccountView} />
    <Route path="/about" component={About} />
    <Route path="/privacy-policy" component={PrivacyPolicy} />
    <Route path="/terms-of-use" component={TermsOfUse} />
    <Route path="/code-of-conduct" component={CodeOfConduct} />
  </Switch>
);

function Routing() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUser());
  }, []);

  return <App>{routes}</App>;
}

export default Routing;
