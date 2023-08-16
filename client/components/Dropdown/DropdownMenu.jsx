import PropTypes from 'prop-types';
import React, { forwardRef, useCallback, useRef, useState } from 'react';
import useModalClose from '../../common/useModalClose';
import DownArrowIcon from '../../images/down-filled-triangle.svg';
import { DropdownWrapper } from '../Dropdown';

// TODO: enable arrow keys to navigate options from list

const DropdownMenu = forwardRef(
  ({ children, 'aria-label': ariaLabel, align, className, classes }, ref) => {
    // Note: need to use a ref instead of a state to avoid stale closures.
    const focusedRef = useRef(false);

    const [isOpen, setIsOpen] = useState(false);

    const close = useCallback(() => setIsOpen(false), [setIsOpen]);

    const anchorRef = useModalClose(close, ref);

    const toggle = useCallback(() => {
      setIsOpen((prevState) => !prevState);
    }, [setIsOpen]);

    const handleFocus = () => {
      focusedRef.current = true;
    };

    const handleBlur = () => {
      focusedRef.current = false;
      setTimeout(() => {
        if (!focusedRef.current) {
          close();
        }
      }, 200);
    };

    return (
      <div ref={anchorRef} className={className}>
        <button
          className={classes.button}
          aria-label={ariaLabel}
          tabIndex="0"
          onClick={toggle}
          onBlur={handleBlur}
          onFocus={handleFocus}
        >
          <DownArrowIcon focusable="false" aria-hidden="true" />
        </button>
        {isOpen && (
          <DropdownWrapper
            className={classes.list}
            align={align}
            onMouseUp={() => {
              setTimeout(close, 0);
            }}
            onBlur={handleBlur}
            onFocus={handleFocus}
          >
            {children}
          </DropdownWrapper>
        )}
      </div>
    );
  }
);

DropdownMenu.propTypes = {
  children: PropTypes.node,
  'aria-label': PropTypes.string.isRequired,
  align: PropTypes.oneOf(['left', 'right']),
  className: PropTypes.string,
  classes: PropTypes.shape({
    button: PropTypes.string,
    list: PropTypes.string
  })
};

DropdownMenu.defaultProps = {
  children: null,
  align: 'right',
  className: '',
  classes: {}
};

export default DropdownMenu;
