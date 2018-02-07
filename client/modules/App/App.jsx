import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import DevTools from './components/DevTools';
import { setPreviousPath } from '../IDE/actions/ide';

class App extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = { isMounted: false };
  }

  componentDidMount() {
    this.setState({ isMounted: true }); // eslint-disable-line react/no-did-mount-set-state
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location !== this.props.location) {
      this.props.setPreviousPath(this.props.location.pathname);
    }
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
  children: PropTypes.element,
  location: PropTypes.shape({
    pathname: PropTypes.string
  }).isRequired,
  setPreviousPath: PropTypes.func.isRequired,
};

App.defaultProps = {
  children: null
};

export default connect(() => ({}), { setPreviousPath })(App);
