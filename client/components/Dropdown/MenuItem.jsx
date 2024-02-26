import PropTypes from 'prop-types';
import React from 'react';
import ButtonOrLink from '../../common/ButtonOrLink';

// TODO: combine with NavMenuItem

function MenuItem({ hideIf, ...rest }) {
  if (hideIf) {
    return null;
  }

  return (
    <li role="menuitem">
      <ButtonOrLink {...rest} />
    </li>
  );
}

MenuItem.propTypes = {
  ...ButtonOrLink.propTypes,
  onClick: PropTypes.func,
  value: PropTypes.string,
  /**
   * Provides a way to deal with optional items.
   */
  hideIf: PropTypes.bool
};

MenuItem.defaultProps = {
  onClick: null,
  value: null,
  hideIf: false
};

export default MenuItem;
