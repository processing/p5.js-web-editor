import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';

import Dropdown from './Dropdown';

import { PreferencesIcon } from '../common/icons';

const OverlayManager = ({ overlay, hideOverlay }) => {
  const ref = useRef({});

  const handleClickOutside = ({ target }) => {
    if (ref && ref.current && !ref.current.contains(target)) {
      hideOverlay();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ref]);

  const headerNavOptions = [
    {
      icon: PreferencesIcon,
      title: 'Preferences',
      href: '/mobile/preferences',
    },
    { icon: PreferencesIcon, title: 'Examples', href: '/mobile/examples' },
    { icon: PreferencesIcon, title: 'Original Editor', href: '/' },
  ];

  const jsx = (
    <React.Fragment>
      <div ref={(r) => { ref.current = r; }} >
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
