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

  const first = () => {
    console.log('first');
    setCurrentIndex(0);
  };
  const last = () => {
    console.log('last');
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
  const match = (e) => {
    const items = Array.from(menuItems);

    const reorderedItems = [
      ...items.slice(currentIndex),
      ...items.slice(0, currentIndex)
    ];

    const matches = reorderedItems.filter((menuItem) => {
      const { textContent } = menuItem.firstChild;
      const firstChar = textContent[0].toLowerCase();
      return e.key === firstChar;
    });

    if (!matches.length) {
      return;
    }

    const currentNode = items[currentIndex];
    const nextMatch = matches.includes(currentNode) ? matches[1] : matches[0];
    const index = items.findIndex((item) => item === nextMatch);
    setCurrentIndex(index);
  };

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
