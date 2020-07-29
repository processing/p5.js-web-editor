import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';

import Dropdown from './Dropdown';

import { PreferencesIcon } from '../common/icons';
import { useHideOnBlur } from '../utils/custom-hooks';


const OverlayManager = ({ overlay, hideOverlay }) => {
  const headerNavOptions = [
    {
      icon: PreferencesIcon,
      title: 'Preferences',
      href: '/mobile/preferences',
    },
    { icon: PreferencesIcon, title: 'Examples', href: '/mobile/examples' },
    {
      icon: PreferencesIcon,
      title: 'Original Editor',
      href: '/mobile/preferences',
    },
  ];

  const setRef = useHideOnBlur(hideOverlay);

  const jsx = (
    <React.Fragment>
      <div ref={setRef} >
        {overlay === 'dropdown' && <Dropdown items={headerNavOptions} />}
      </div>
    </React.Fragment>
  );

  return jsx && createPortal(jsx, document.body);
};


OverlayManager.propTypes = {
  overlay: PropTypes.string,
  hideOverlay: PropTypes.func.isRequired,
};

OverlayManager.defaultProps = { overlay: null };

export default OverlayManager;
