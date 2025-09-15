import React, { forwardRef, useCallback, useRef, useState } from 'react';
import styled from 'styled-components';
import { remSize, prop } from '../../theme';
import { useModalClose } from '../../common/useModalClose';
import DownArrowIcon from '../../images/down-filled-triangle.svg';

export enum DropdownMenuAlignment {
  RIGHT = 'right',
  LEFT = 'left'
}

interface StyledDropdownMenuProps {
  align: DropdownMenuAlignment;
}

const DropdownWrapper = styled.ul<StyledDropdownMenuProps>`
  background-color: ${prop('Modal.background')};
  border: 1px solid ${prop('Modal.border')};
  box-shadow: 0 0 18px 0 ${prop('shadowColor')};
  color: ${prop('primaryTextColor')};

  position: absolute;
  right: ${(props) =>
    props.align === DropdownMenuAlignment.RIGHT ? 0 : 'initial'};
  left: ${(props) =>
    props.align === DropdownMenuAlignment.LEFT ? 0 : 'initial'};

  text-align: left;
  width: ${remSize(180)};
  display: flex;
  flex-direction: column;
  height: auto;
  z-index: 2;
  border-radius: ${remSize(6)};

  & li:first-child {
    border-radius: ${remSize(5)} ${remSize(5)} 0 0;
  }
  & li:last-child {
    border-radius: 0 0 ${remSize(5)} ${remSize(5)};
  }

  & li:hover {
    background-color: ${prop('Button.primary.hover.background')};
    color: ${prop('Button.primary.hover.foreground')};

    * {
      color: ${prop('Button.primary.hover.foreground')};
    }
  }

  li {
    height: ${remSize(36)};
    cursor: pointer;
    display: flex;
    align-items: center;

    & button,
    & button span,
    & a {
      padding: ${remSize(8)} ${remSize(16)};
      font-size: ${remSize(12)};
    }

    * {
      text-align: left;
      justify-content: left;

      color: ${prop('primaryTextColor')};
      width: 100%;
      justify-content: flex-start;
    }

    & button span {
      padding: 0px;
    }
  }
`;

export interface DropdownMenuProps extends StyledDropdownMenuProps {
  /**
   * Provide <MenuItem> elements as children to control the contents of the menu.
   */
  children: React.ReactNode;
  /**
   * Can optionally override the contents of the button which opens the menu.
   * Defaults to <DownArrowIcon>
   */
  anchor?: React.ReactNode;
  'aria-label': string;
  className?: string;
  classes?: {
    button?: string;
    list?: string;
  };
  maxHeight?: string;
}

export const DropdownMenu = forwardRef<HTMLDivElement, DropdownMenuProps>(
  (
    {
      children,
      anchor,
      'aria-label': ariaLabel,
      align = DropdownMenuAlignment.RIGHT,
      className = '',
      classes = {},
      maxHeight
    },
    ref
  ) => {
    // Note: need to use a ref instead of a state to avoid stale closures.
    const focusedRef = useRef(false);

    const [isOpen, setIsOpen] = useState(false);

    const close = useCallback(() => setIsOpen(false), [setIsOpen]);

    const anchorRef = useModalClose<HTMLDivElement>(close, ref);

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
          // close();
        }
      }, 200);
    };

    return (
      <div ref={anchorRef} className={className} aria-haspopup="menu">
        <button
          className={classes.button}
          aria-label={ariaLabel}
          tabIndex={0}
          onClick={toggle}
          onBlur={handleBlur}
          onFocus={handleFocus}
        >
          {anchor ?? <DownArrowIcon focusable="false" aria-hidden="true" />}
        </button>
        {isOpen && (
          <DropdownWrapper
            role="menu"
            className={classes.list}
            align={align}
            onMouseUp={() => {
              setTimeout(close, 0);
            }}
            onBlur={handleBlur}
            onFocus={handleFocus}
            style={maxHeight ? { maxHeight, overflowY: 'auto' } : undefined}
          >
            {children}
          </DropdownWrapper>
        )}
      </div>
    );
  }
);
