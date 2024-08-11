import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Route as RouterRoute, Switch } from 'react-router-dom';

import App from './modules/App/App';
import IDEView from './modules/IDE/pages/IDEView';
import FullView from './modules/IDE/pages/FullView';
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
import LanguageSelector from './components/LanguageSelector'; // Import LanguageSelector

const withParams = (Component) => (props) => (
  <Component {...props} params={props.match.params} />
);

const Route = ({ component, ...props }) => (
  <RouterRoute component={withParams(component)} {...props} />
);

Route.propTypes = {
  ...RouterRoute.propTypes,
  component: PropTypes.elementType.isRequired,
};

const routes = (
  <Switch>
    <Route exact path="/" component={IDEView} />
    <Route path="/login" component={LoginView} />
    <Route path="/signup" component={SignupView} />
    <Route path="/reset-password/:reset_password_token" component={NewPasswordView} />
    <Route path="/reset-password" component={ResetPasswordView} />
    <Route path="/verify" component={EmailVerificationView} />
    <Route path="/projects/:project_id" component={IDEView} />
    <Route path="/:username/full/:project_id" component={FullView} />
    <Route path="/full/:project_id" component={FullView} />
    <Route path="/:username/assets" component={DashboardView} />
    <Route path="/:username/sketches/:project_id/add-to-collection" component={IDEView} />
    <Route path="/:username/sketches/:project_id" component={IDEView} />
    <Route path="/:username/sketches" component={DashboardView} />
    <Route path="/:username/collections/:collection_id" component={CollectionView} />
    <Route path="/:username/collections" component={DashboardView} />
    <Route path="/sketches" component={DashboardView} />
    <Route path="/assets" component={DashboardView} />
    <Route path="/account" component={AccountView} />
    <Route path="/about" component={IDEView} />
    <Route path="/privacy-policy" component={PrivacyPolicy} />
    <Route path="/terms-of-use" component={TermsOfUse} />
    <Route path="/code-of-conduct" component={CodeOfConduct} />
  </Switch>
);

function Routing() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  return (
    <App>
      <header>
        {/* Include the LanguageSelector in the header */}
        <LanguageSelector />
      </header>
      {routes}
    </App>
  );
}

export default Routing;
