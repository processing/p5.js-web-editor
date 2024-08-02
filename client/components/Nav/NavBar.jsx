import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import useModalClose from '../../common/useModalClose';
import { MenuOpenContext, NavBarContext } from './contexts';

function NavBar({ children, className }) {
  const [dropdownOpen, setDropdownOpen] = useState('none');

  const timerRef = useRef(null);

  const handleClose = useCallback(() => {
    setDropdownOpen('none');
  }, [setDropdownOpen]);

  const nodeRef = useModalClose(handleClose);

  const clearHideTimeout = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [timerRef]);

  const handleBlur = useCallback(() => {
    timerRef.current = setTimeout(() => setDropdownOpen('none'), 10);
  }, [timerRef, setDropdownOpen]);

  const toggleDropdownOpen = useCallback(
    (dropdown) => {
      setDropdownOpen((prevState) =>
        prevState === dropdown ? 'none' : dropdown
      );
    },
    [setDropdownOpen]
  );

  const contextValue = useMemo(
    () => ({
      createDropdownHandlers: (dropdown) => ({
        onMouseOver: () => {
          setDropdownOpen((prevState) =>
            prevState === 'none' ? 'none' : dropdown
          );
        },
        onClick: () => {
          toggleDropdownOpen(dropdown);
        },
        onBlur: handleBlur,
        onFocus: clearHideTimeout
      }),
      createMenuItemHandlers: (dropdown) => ({
        onMouseUp: (e) => {
          if (e.button === 2) {
            return;
          }
          setDropdownOpen('none');
        },
        onBlur: handleBlur,
        onFocus: () => {
          clearHideTimeout();
          setDropdownOpen(dropdown);
        }
      }),
      toggleDropdownOpen
    }),
    [setDropdownOpen, toggleDropdownOpen, clearHideTimeout, handleBlur]
  );

  return (
    <NavBarContext.Provider value={contextValue}>
      <header>
        <div className={className} ref={nodeRef}>
          <MenuOpenContext.Provider value={dropdownOpen}>
            {children}
          </MenuOpenContext.Provider>
        </div>
      </header>
    </NavBarContext.Provider>
  );
}

NavBar.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string
};

NavBar.defaultProps = {
  children: null,
  className: 'nav'
};

export default NavBar;
