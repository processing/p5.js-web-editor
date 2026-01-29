import React from 'react';
import { useSelector } from 'react-redux';
import { ThemeProvider as TProvider } from 'styled-components';
import theme from '../../../theme';
import type { RootState } from '../../../reducers';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const currentTheme = useSelector(
    (state: RootState) => state.preferences.theme
  );
  return <TProvider theme={{ ...theme[currentTheme] }}>{children}</TProvider>;
};
