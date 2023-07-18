import PropTypes from 'prop-types';
import React, { useContext, useMemo } from 'react';
import ButtonOrLink from '../../common/ButtonOrLink';
import { NavBarContext, ParentMenuContext } from './contexts';

function NavMenuItem({ hideIf, ...rest }) {
  const parent = useContext(ParentMenuContext);

  const { createMenuItemHandlers } = useContext(NavBarContext);

  const handlers = useMemo(
    () => createMenuItemHandlers(parent),
    [createMenuItemHandlers, parent]
  );

  if (hideIf) {
    return null;
  }

  return (
    <li className="nav__dropdown-item">
      <ButtonOrLink {...rest} {...handlers} />
    </li>
  );
}

NavMenuItem.propTypes = {
  ...ButtonOrLink.propTypes,
  onClick: PropTypes.func,
  value: PropTypes.string,
  /**
   * Provides a way to deal with optional items.
   */
  hideIf: PropTypes.bool
};

NavMenuItem.defaultProps = {
  onClick: null,
  value: null,
  hideIf: false
};

export default NavMenuItem;
