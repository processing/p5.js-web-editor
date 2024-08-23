import PropTypes from 'prop-types';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import useModalClose from '../../common/useModalClose';
import { MenuOpenContext, NavBarContext } from './contexts';
import usePrevious from '../../modules/IDE/hooks/usePrevious';
import useKeyDownHandlers from '../../common/useKeyDownHandlers';

function NavBar({ children, className }) {
  const [dropdownOpen, setDropdownOpen] = useState('none');
  const [currentIndex, setCurrentIndex] = useState(0);
  const prevIndex = usePrevious(currentIndex) ?? null;
  const menuItems = useRef(new Set()).current;
  const timerRef = useRef(null);

  const first = () => {
    setCurrentIndex(0);
  };
  const last = () => {
    setCurrentIndex(menuItems.size - 1);
  };
  const next = () => {
    const index = currentIndex === menuItems.size - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(index);
  };
  const prev = () => {
    const index = currentIndex === 0 ? menuItems.size - 1 : currentIndex - 1;
    setCurrentIndex(index);
  };

  // match focused item to typed character; if no match, focus is not moved

  useEffect(() => {
    if (currentIndex !== prevIndex) {
      const items = Array.from(menuItems);
      const currentNode = items[currentIndex]?.firstChild;
      const prevNode = items[prevIndex]?.firstChild;

      prevNode?.setAttribute('tabindex', -1);
      currentNode?.setAttribute('tabindex', 0);
      currentNode?.focus();
    }
  }, [currentIndex, prevIndex, menuItems]);

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

  useKeyDownHandlers({
    ArrowLeft: (e) => {
      e.preventDefault();
      e.stopPropagation();
      prev();
    },
    ArrowRight: (e) => {
      e.preventDefault();
      e.stopPropagation();
      next();
    },
    Home: (e) => {
      e.preventDefault();
      e.stopPropagation();
      first();
    },
    End: (e) => {
      e.preventDefault();
      e.stopPropagation();
      last();
    }
    // keydown event listener for letter keys
  });

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
      toggleDropdownOpen,
      menuItems
    }),
    [
      setDropdownOpen,
      toggleDropdownOpen,
      clearHideTimeout,
      handleBlur,
      menuItems
    ]
  );

  return (
    <NavBarContext.Provider value={contextValue}>
      <header>
        <div className={className} ref={nodeRef}>
          <MenuOpenContext.Provider value={dropdownOpen}>
            <ul className="nav__items-left" role="menubar">
              {children}
            </ul>
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
