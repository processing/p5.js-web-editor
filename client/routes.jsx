import { useDispatch } from 'react-redux';
import React, { useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';

import RedirectToUser from './components/createRedirectWithUsername';
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
import { ElementFromComponent } from './utils/router-compatibilty';

/**
 * Wrapper around App for handling legacy 'onChange' and 'onEnter' functionality,
 * injecting the location prop, and rendering child route content.
 */
const Main = () => {
  const location = useLocation();

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUser());
  }, []);

  // TODO: This short-circuit seems unnecessary - using the mobile <Switch /> navigator (future) should prevent this from being called
  useEffect(() => {
    if (location.pathname.includes('preview')) return;

    dispatch(stopSketch());
  }, [location.pathname]);

  return (
    <App location={location}>
      <Outlet />
    </App>
  );
};

const routes = [
  {
    path: '/',
    element: <Main />,
    children: [
      {
        index: true,
        element: (
          <ElementFromComponent
            component={mobileFirst(MobileIDEView, IDEView)}
          />
        )
      },
      {
        path: '/login',
        element: (
          <ElementFromComponent
            component={userIsNotAuthenticated(
              mobileFirst(responsiveForm(LoginView), LoginView)
            )}
          />
        )
      },
      {
        path: '/signup',
        element: (
          <ElementFromComponent
            component={userIsNotAuthenticated(
              mobileFirst(responsiveForm(SignupView), SignupView)
            )}
          />
        )
      },
      {
        path: '/reset-password',
        element: (
          <ElementFromComponent
            component={userIsNotAuthenticated(ResetPasswordView)}
          />
        )
      },
      { path: '/verify', element: <EmailVerificationView /> },
      {
        path: '/reset-password/:reset_password_token',
        element: <NewPasswordView />
      },
      {
        path: '/projects/:project_id',
        element: <ElementFromComponent component={IDEView} />
      },
      { path: '/:username/full/:project_id', element: <FullView /> },
      { path: '/full/:project_id', element: <FullView /> },
      {
        path: '/:username/assets',
        element: (
          <ElementFromComponent
            component={userIsAuthenticated(
              userIsAuthorized(mobileFirst(MobileDashboardView, DashboardView))
            )}
          />
        )
      },
      {
        path: '/:username/sketches',
        element: (
          <ElementFromComponent
            component={mobileFirst(MobileDashboardView, DashboardView)}
          />
        )
      },
      {
        path: '/:username/sketches/:project_id',
        element: (
          <ElementFromComponent
            component={mobileFirst(MobileIDEView, IDEView)}
          />
        )
      },
      {
        path: '/:username/sketches/:project_id/add-to-collection',
        element: (
          <ElementFromComponent
            component={mobileFirst(MobileIDEView, IDEView)}
          />
        )
      },
      {
        path: '/:username/collections',
        element: (
          <ElementFromComponent
            component={mobileFirst(MobileDashboardView, DashboardView)}
          />
        )
      },
      {
        path: '/:username/collections/:collection_id',
        element: <ElementFromComponent component={CollectionView} />
      },
      {
        path: '/sketches',
        element: <RedirectToUser url="/:username/sketches" />
      },
      {
        path: '/assets',
        element: <RedirectToUser url="/:username/assets" />
      },
      {
        path: '/account',
        element: (
          <ElementFromComponent component={userIsAuthenticated(AccountView)} />
        )
      },
      {
        path: '/about',
        element: <ElementFromComponent component={IDEView} />
      },
      /* Mobile-only Routes */
      { path: '/preview', element: <MobileSketchView /> },
      { path: '/preferences', element: <MobilePreferences /> },
      { path: '/privacy-policy', element: <Legal /> },
      { path: '/terms-of-use', element: <Legal /> },
      {
        path: '/code-of-conduct',
        element: <Legal />
      }
    ]
  }
];

export default routes;
