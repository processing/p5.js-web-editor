import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import DevTools from './components/DevTools';
import classNames from 'classnames';

class App extends React.Component {
  constructor(props, context) {
    super(props, context);
    console.log(props);
    this.state = { isMounted: false };
  }

  componentDidMount() {
    this.setState({ isMounted: true }); // eslint-disable-line react/no-did-mount-set-state
  }

  render() {
    const theme = this.props.route.theme;
    const appClass = classNames({
      app: true,
      light: theme === 'light',
      dark: theme === 'dark'
    });
    return (
      <div className={appClass}>
        {this.state.isMounted && !window.devToolsExtension && process.env.NODE_ENV === 'development' && <DevTools />}
        {this.props.children}
      </div>
    );
  }
}

App.propTypes = {
  children: PropTypes.object,
  route: PropTypes.shape({
    theme: PropTypes.string.isRequired
  }).isRequired
};

export default connect()(App);
