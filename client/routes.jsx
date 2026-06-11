import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Route as RouterRoute, Switch } from 'react-router-dom';

import { App } from './modules/App/App';
import IDEView from './modules/IDE/pages/IDEView';
import FullView from './modules/IDE/pages/FullView';
import { About } from './modules/About/pages/About';
import { CodeOfConduct } from './modules/Legal/pages/CodeOfConduct';
import { PrivacyPolicy } from './modules/Legal/pages/PrivacyPolicy';
import { TermsOfUse } from './modules/Legal/pages/TermsOfUse';
import { LoginView } from './modules/User/pages/LoginView';
import { SignupView } from './modules/User/pages/SignupView';
import { CollectionView } from './modules/User/pages/CollectionView';
import DashboardView from './modules/User/pages/DashboardView';
import { getUser } from './modules/User/actions';
import { getStoredToken } from './utils/opAuth';
import ProtectedSketchRoute from './protected-route';

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
    <ProtectedSketchRoute exact path="/" component={IDEView} />
    <Route path="/login" component={LoginView} />
    <Route path="/signup" component={SignupView} />
    <Route path="/projects/:project_id" component={IDEView} />
    <ProtectedSketchRoute
      path="/:username/full/:project_id"
      component={FullView}
    />
    <ProtectedSketchRoute path="/full/:project_id" component={FullView} />

    <Route path="/:username/assets" component={DashboardView} />
    <Route
      path="/:username/sketches/:project_id/add-to-collection"
      component={IDEView}
    />
    <ProtectedSketchRoute
      path="/:username/sketches/:project_id"
      component={IDEView}
    />
    <Route path="/:username/sketches" component={DashboardView} />
    <Route
      path="/:username/collections/:collection_id"
      component={CollectionView}
    />
    <Route path="/:username/collections" component={DashboardView} />
    <Route path="/sketches" component={DashboardView} />
    <Route path="/assets" component={DashboardView} />
    <Route path="/about" component={About} />
    <Route path="/privacy-policy" component={PrivacyPolicy} />
    <Route path="/terms-of-use" component={TermsOfUse} />
    <Route path="/code-of-conduct" component={CodeOfConduct} />
  </Switch>
);

function Routing() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Only hydrate identity if we have an OP access token. Otherwise the
    // user is a guest; /api/whoami without a token would just 401.
    if (getStoredToken()) {
      dispatch(getUser());
    }
  }, []);

  return <App>{routes}</App>;
}

export default Routing;
