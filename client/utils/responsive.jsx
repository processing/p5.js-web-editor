import React from 'react';
import MediaQuery from 'react-responsive';
import ResponsiveForm from '../modules/User/components/ResponsiveForm';

export const mobileEnabled = () => (window.process.env.MOBILE_ENABLED === true);


/** createMobileFirst: Receives the store, and creates a function that chooses between two components,
 * aimed at mobile and desktop resolutions, respectively.
 * The created function returns a Component (props => jsx)
 */
export const createMobileFirst = store => (MobileComponent, Fallback) => props => (
  <MediaQuery minWidth={770}>
    {matches => ((matches || (store && store.getState().editorAccessibility.forceDesktop) || (!mobileEnabled()))
      ? <Fallback {...props} />
      : <MobileComponent {...props} />)}
  </MediaQuery>);

export const responsiveForm = DesktopComponent => props => (
  <ResponsiveForm>
    <DesktopComponent {...props} />
  </ResponsiveForm>
);
