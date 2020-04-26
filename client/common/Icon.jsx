/* eslint-disable global-require */
import InlineSVG from 'react-inlinesvg';
import PropTypes from 'prop-types';
import React from 'react';
import lodash from 'lodash';

const icons = {
  sortArrowUp: require('../images/sort-arrow-up.svg'),
  sortArrowDown: require('../images/sort-arrow-down.svg'),
  github: require('../images/github.svg'),
  google: require('../images/google.svg'),
  plus: require('../images/plus-icon.svg'),
  close: require('../images/close.svg'),
};

/*
  names will be an mirror-object of icon names:
    {
      github: 'github',
      ...
    }
*/
const names = lodash.mapValues(icons, (value, key) => key);

export const ValidIconNameType = PropTypes.oneOf(Object.keys(names));


function Icon({ name, ...props }) {
  return (
    <InlineSVG src={icons[name]} {...props} />
  );
}


Icon.names = names;

Icon.propTypes = {
  name: ValidIconNameType.isRequired
};

export default Icon;
