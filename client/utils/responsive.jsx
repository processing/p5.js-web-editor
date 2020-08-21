import React from 'react';
import { useSelector } from 'react-redux';
import MediaQuery from 'react-responsive';
import ResponsiveForm from '../modules/User/components/ResponsiveForm';

export const mobileEnabled = () => (window.process.env.MOBILE_ENABLED === true);

/** createMobileFirst: Receives the store, and creates a function that chooses between two components,
 * aimed at mobile and desktop resolutions, respectively.
 * The created function returns a Component (props => jsx)
 */
export const createMobileFirst = store => (MobileComponent, Fallback) => (props) => {
  const { forceDesktop } = useSelector(state => state.editorAccessibility);
  return (
    <MediaQuery minWidth={770}>
      {matches => ((matches || (store && forceDesktop) || (!mobileEnabled()))
        ? <Fallback {...props} />
        : <MobileComponent {...props} />)}
    </MediaQuery>
  );
};

export const responsiveForm = DesktopComponent => props => (
  <ResponsiveForm>
    <DesktopComponent {...props} />
  </ResponsiveForm>
);
