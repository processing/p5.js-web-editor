import React from 'react';
import { useSelector } from 'react-redux';
import MediaQuery from 'react-responsive';
import ResponsiveForm from '../modules/User/components/ResponsiveForm';

export const mobileEnabled = () => window.process.env.MOBILE_ENABLED === true;

export const mobileFirst = (MobileComponent, Fallback) => (props) => {
  const { forceDesktop } = useSelector((state) => state.editorAccessibility);
  return (
    <MediaQuery minWidth={770}>
      {(matches) =>
        matches || forceDesktop || !mobileEnabled() ? (
          <Fallback {...props} />
        ) : (
          <MobileComponent {...props} />
        )
      }
    </MediaQuery>
  );
};

export const responsiveForm = (DesktopComponent) => (props) =>
  (
    <ResponsiveForm>
      <DesktopComponent {...props} />
    </ResponsiveForm>
  );
