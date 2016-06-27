import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import DevTools from './components/DevTools';

class App extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = { isMounted: false };
  }

  componentDidMount() {
    this.setState({ isMounted: true }); // eslint-disable-line no-did-mount-set-state
  }

  render() {
    return (
      <div className="app">
        {this.state.isMounted && !window.devToolsExtension && process.env.NODE_ENV === 'development' && <DevTools />}
        {this.props.children}
      </div>
    );
  }
}

App.propTypes = {
  children: PropTypes.object
};

export default connect()(App);
