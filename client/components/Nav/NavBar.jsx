import PropTypes from 'prop-types';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { MenuOpenContext, NavBarContext } from './contexts';

function NavBar({ children }) {
  const [dropdownOpen, setDropdownOpen] = useState('none');

  const timerRef = useRef(null);

  const nodeRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (!nodeRef.current) {
        return;
      }
      if (nodeRef.current.contains(e.target)) {
        return;
      }
      setDropdownOpen('none');
    }
    document.addEventListener('mousedown', handleClick, false);
    return () => {
      document.removeEventListener('mousedown', handleClick, false);
    };
  }, [nodeRef, setDropdownOpen]);

  // TODO: replace with `useKeyDownHandlers` after #2052 is merged
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.keyCode === 27) {
        setDropdownOpen('none');
      }
    }
    document.addEventListener('keydown', handleKeyDown, false);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, false);
    };
  }, [setDropdownOpen]);

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
