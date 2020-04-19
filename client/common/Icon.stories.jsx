import React from 'react';
import { select } from '@storybook/addon-knobs';

import Icon from './Icon';

export default {
  title: 'Common/Icon',
  component: Icon
};

export const AllIcons = () => {
  const firstIconName = Object.keys(Icon.names)[0];

  return (
    <Icon name={select('name', Icon.names, firstIconName)} />
  );
};
