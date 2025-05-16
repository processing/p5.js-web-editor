import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import theme, { Theme } from '../../../theme';
import { setTheme } from '../../IDE/actions/preferences';

const Provider = ({ children }) => {
  const currentTheme = useSelector((state) => state.preferences.theme);
  const dispatch = useDispatch();

  // Detect system color scheme preference on initial load
  useEffect(() => {
    // Only apply system preference if the user hasn't explicitly set a theme
    const userHasExplicitlySetTheme =
      localStorage.getItem('has_set_theme') === 'true';
    if (!userHasExplicitlySetTheme) {
      const prefersDarkMode =
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;

      if (prefersDarkMode) {
        dispatch(setTheme(Theme.dark, { isSystemPreference: true }));
      } else {
        dispatch(setTheme(Theme.light, { isSystemPreference: true }));
      }
    }

    // Listen for changes to system color scheme preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e) => {
      if (localStorage.getItem('has_set_theme') !== 'true') {
        dispatch(
          setTheme(e.matches ? Theme.dark : Theme.light, {
            isSystemPreference: true
          })
        );
      }
    };

    // Add event listener with modern API if available
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    // Clean up event listener
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [dispatch]);

  return (
    <ThemeProvider theme={{ ...theme[currentTheme] }}>{children}</ThemeProvider>
  );
};

Provider.propTypes = {
  children: PropTypes.node.isRequired
};

export default Provider;
