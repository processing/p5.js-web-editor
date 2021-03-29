import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ThemeProvider } from 'styled-components';

import theme, { Theme } from '../../../theme';

const Provider = ({ children, currentTheme }) => (
  <ThemeProvider theme={{ ...theme[currentTheme] }}>{children}</ThemeProvider>
);

Provider.propTypes = {
  children: PropTypes.node.isRequired,
  currentTheme: PropTypes.oneOf(Object.keys(Theme)).isRequired
};

function mapStateToProps(state) {
  return {
    currentTheme: state.preferences.theme
  };
}

export default connect(mapStateToProps)(Provider);
