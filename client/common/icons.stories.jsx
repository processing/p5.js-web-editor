import React from 'react';
import { select } from '@storybook/addon-knobs';

import * as icons from './icons';

export default {
  title: 'Common/Icons',
  component: icons
};

export const AllIcons = () => {
  const names = Object.keys(icons);

  const SelectedIcon = icons[select('name', names, names[0])];
  return <SelectedIcon />;
};
