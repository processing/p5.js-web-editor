import React from 'react';
import { select } from '@storybook/addon-knobs';

import * as Icons from './Icons';

export default {
  title: 'Common/Icons',
  component: Icons
};

export const AllIcons = () => {
  const names = Object.keys(Icons);

  const SelectedIcon = Icons[select('name', names, names[0])];
  return (
    <SelectedIcon />
  );
};
