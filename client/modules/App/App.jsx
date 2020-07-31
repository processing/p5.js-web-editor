import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import getConfig from '../../utils/getConfig';
import DevTools from './components/DevTools';
import { setPreviousPath } from '../IDE/actions/ide';

class App extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = { isMounted: false };
  }

  componentDidMount() {
    this.setState({ isMounted: true }); // eslint-disable-line react/no-did-mount-set-state
    document.body.className = this.props.theme;
  }

  componentWillReceiveProps(nextProps) {
    const locationWillChange = nextProps.location !== this.props.location;
    const shouldSkipRemembering = nextProps.location.state && nextProps.location.state.skipSavingPath === true;

    if (locationWillChange && !shouldSkipRemembering) {
      this.props.setPreviousPath(this.props.location.pathname);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.theme !== prevProps.theme) {
      document.body.className = this.props.theme;
    }
  }

  render() {
    return (
      <div className="app">
        {/* FIXME: remove false */}
        {this.state.isMounted && !window.devToolsExtension && getConfig('NODE_ENV') === 'development' && <DevTools />}
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
  theme: PropTypes.string,
};

App.defaultProps = {
  children: null,
  theme: 'light'
};

const mapStateToProps = state => ({
  theme: state.preferences.theme,
});

const mapDispatchToProps = { setPreviousPath };

export default connect(mapStateToProps, mapDispatchToProps)(App);
