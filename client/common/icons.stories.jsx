import React from 'react';

import * as icons from './icons';

export default {
  title: 'Common/Icons',
  component: icons,
  argTypes: {
    variant: {
      options: Object.keys(icons),
      control: { type: 'select' },
      default: icons.CircleFolderIcon
    }
  }
};

export const Icons = (args) => {
  const SelectedIcon = icons[args.variant || 'CircleInfoIcon'];
  return <SelectedIcon />;
};
