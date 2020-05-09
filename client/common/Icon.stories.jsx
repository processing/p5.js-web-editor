import React from 'react';
import { select } from '@storybook/addon-knobs';

import Icon from './Icon';

export default {
  title: 'Common/Icon',
  component: Icon
};

export const AllIcons = () => {
  const names = Object.keys(Icon);

  const SelectedIcon = Icon[select('name', names, names[0])];
  return (
    <SelectedIcon />
  );
};
