import { upperFirst } from 'lodash';
import React from 'react';
import styled, { ThemeProvider } from 'styled-components';
import theme, { prop } from '../client/theme';

const PreviewArea = styled.div`
  background: ${prop('backgroundColor')};
  flex-grow: 1;
  padding: 2rem;
  & > h4 {
    margin-top: 0;
    color: ${prop('primaryTextColor')};
  }
`;

const themeKeys = Object.keys(theme);

export const withThemeProvider = (Story, context) => {
  const setting = context.globals.theme;
  if (setting === 'all') {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {Object.keys(theme).map((themeName) => (
          <ThemeProvider theme={theme[themeName]} key={themeName}>
            <PreviewArea className={themeName}>
              <h4>{upperFirst(themeName)}</h4>
              <Story />
            </PreviewArea>
          </ThemeProvider>
        ))}
      </div>
    );
  } else {
    const themeName = setting;
    return (
      <ThemeProvider theme={theme[themeName]}>
        <PreviewArea className={themeName}>
          <Story />
        </PreviewArea>
      </ThemeProvider>
    );
  }
};

export const themeToolbarItem = {
  description: 'Global theme for components',
  defaultValue: 'all',
  toolbar: {
    title: 'Theme',
    icon: 'mirror',
    items: [...themeKeys, 'all']
  }
};
