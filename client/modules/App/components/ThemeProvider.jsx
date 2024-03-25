import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import theme from '../../../theme';

const Provider = ({ children }) => {
  const currentTheme = useSelector((state) => state.preferences.theme);
  return (
    <ThemeProvider theme={{ ...theme[currentTheme] }}>{children}</ThemeProvider>
  );
};

Provider.propTypes = {
  children: PropTypes.node.isRequired
};

export default Provider;
