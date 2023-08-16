import React from 'react';
import { addDecorator, addParameters } from '@storybook/react';
import { withKnobs } from "@storybook/addon-knobs";
import { withThemePlayground } from 'storybook-addon-theme-playground';
import { ThemeProvider } from "styled-components";

import theme, { Theme } from '../client/theme';

addDecorator(withKnobs);

const themeConfigs = Object.values(Theme).map(
  name => {
    return { name, theme: theme[name] };
  }
);

addDecorator(withThemePlayground({
  theme: themeConfigs,
  provider: ThemeProvider
}));

addParameters({
  options: {
    /**
     * display the top-level grouping as a "root" in the sidebar
     */
    showRoots: true,
  },
})

// addDecorator(storyFn => <ThemeProvider theme={theme}>{storyFn()}</ThemeProvider>);
