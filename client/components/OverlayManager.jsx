import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';

import Dropdown from './Dropdown';

import { PreferencesIcon } from '../common/icons';
import { useModalBehavior } from '../utils/custom-hooks';


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

  // const setRef = useModalBehavior(hideOverlay);
  // const [visible, trigger, setRef] = useModalBehavior();

  const jsx = (
    <React.Fragment>
      {/* <div ref={setRef} >
        {visible && <Dropdown items={headerNavOptions} />}
      </div> */}
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
