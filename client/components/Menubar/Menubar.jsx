import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import useModalClose from '../../common/useModalClose';
import { MenuOpenContext, MenubarContext } from './contexts';

function Menubar({ children, className }) {
  const [menuOpen, setMenuOpen] = useState('none');

  const timerRef = useRef(null);

  const handleClose = useCallback(() => {
    setMenuOpen('none');
  }, [setMenuOpen]);

  const nodeRef = useModalClose(handleClose);

  const clearHideTimeout = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [timerRef]);

  const handleBlur = useCallback(() => {
    timerRef.current = setTimeout(() => setMenuOpen('none'), 10);
  }, [timerRef, setMenuOpen]);

  const toggleMenuOpen = useCallback(
    (menu) => {
      setMenuOpen((prevState) => (prevState === menu ? 'none' : menu));
    },
    [setMenuOpen]
  );

  const contextValue = useMemo(
    () => ({
      createMenuHandlers: (menu) => ({
        onMouseOver: () => {
          setMenuOpen((prevState) => (prevState === 'none' ? 'none' : menu));
        },
        onClick: () => {
          toggleMenuOpen(menu);
        },
        onBlur: handleBlur,
        onFocus: clearHideTimeout
      }),
      createMenuItemHandlers: (menu) => ({
        onMouseUp: (e) => {
          if (e.button === 2) {
            return;
          }
          setMenuOpen('none');
        },
        onBlur: handleBlur,
        onFocus: () => {
          clearHideTimeout();
          setMenuOpen(menu);
        }
      }),
      toggleMenuOpen
    }),
    [setMenuOpen, toggleMenuOpen, clearHideTimeout, handleBlur]
  );

  return (
    <MenubarContext.Provider value={contextValue}>
      <div className={className} ref={nodeRef}>
        <MenuOpenContext.Provider value={menuOpen}>
          {children}
        </MenuOpenContext.Provider>
      </div>
    </MenubarContext.Provider>
  );
}

Menubar.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string
};

Menubar.defaultProps = {
  children: null,
  className: 'nav'
};

export default Menubar;
