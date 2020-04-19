/* eslint-disable global-require */
import InlineSVG from 'react-inlinesvg';
import PropTypes from 'prop-types';
import React from 'react';
import lodash from 'lodash';

const icons = {
  github: require('../images/github.svg'),
  google: require('../images/google.svg'),
};

/*
  names will be an mirror-object of icon names:
    {
      github: 'github',
      ...
    }
*/
const names = lodash.mapValues(icons, (value, key) => key);


function Icon({ name, ...props }) {
  return (
    <InlineSVG src={icons[name]} {...props} />
  );
}

Icon.names = names;

Icon.propTypes = {
  name: PropTypes.oneOf(Object.keys(names)).isRequired
};

export default Icon;
