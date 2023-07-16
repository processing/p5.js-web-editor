import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import useModalClose from '../../common/useModalClose';
import { MenuOpenContext, NavBarContext } from './contexts';

function NavBar({ children }) {
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

  const contextValue = useMemo(
    () => ({
      createDropdownHandlers: (dropdown) => ({
        onMouseOver: () => {
          setDropdownOpen((prevState) =>
            prevState === 'none' ? 'none' : dropdown
          );
        },
        onClick: () => {
          setDropdownOpen((prevState) =>
            prevState === 'none' ? dropdown : 'none'
          );
        },
        onBlur: handleBlur,
        onFocus: clearHideTimeout
      }),
      createMenuItemHandlers: (dropdown) => ({
        onMouseUp: () => {
          setDropdownOpen('none');
        },
        onBlur: handleBlur,
        onFocus: () => {
          clearHideTimeout();
          setDropdownOpen(dropdown);
        }
      })
    }),
    [setDropdownOpen, clearHideTimeout, handleBlur]
  );

  return (
    <NavBarContext.Provider value={contextValue}>
      <header>
        <nav className="nav" ref={nodeRef}>
          <MenuOpenContext.Provider value={dropdownOpen}>
            {children}
          </MenuOpenContext.Provider>
        </nav>
      </header>
    </NavBarContext.Provider>
  );
}

NavBar.propTypes = {
  children: PropTypes.node
};

NavBar.defaultProps = {
  children: null
};

export default NavBar;
