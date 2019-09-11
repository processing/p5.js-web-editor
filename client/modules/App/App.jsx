import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import DevTools from './components/DevTools';
import { setPreviousPath } from '../IDE/actions/ide';

const __process = (typeof global !== 'undefined' ? global : window).process;

class App extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = { isMounted: false };
  }

  componentDidMount() {
    this.setState({ isMounted: true }); // eslint-disable-line react/no-did-mount-set-state
    document.body.className = 'light';
  }

  componentWillReceiveProps(nextProps) {
    const locationWillChange = nextProps.location !== this.props.location;
    const shouldSkipRemembering = nextProps.location.state && nextProps.location.state.skipSavingPath === true;

    if (locationWillChange && !shouldSkipRemembering) {
      this.props.setPreviousPath(this.props.location.pathname);
    }
  }

  render() {
    return (
      <div className="app">
        {this.state.isMounted && !window.devToolsExtension && __process.env.NODE_ENV === 'development' && <DevTools />}
        {this.props.children}
      </div>
    );
  }
}

App.propTypes = {
  children: PropTypes.element,
  location: PropTypes.shape({
    pathname: PropTypes.string,
    state: PropTypes.shape({
      skipSavingPath: PropTypes.bool,
    }),
  }).isRequired,
  setPreviousPath: PropTypes.func.isRequired,
};

App.defaultProps = {
  children: null
};

export default connect(() => ({}), { setPreviousPath })(App);
