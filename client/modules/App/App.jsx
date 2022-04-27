import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import getConfig from '../../utils/getConfig';
import DevTools from './components/DevTools';
import { setPreviousPath } from '../IDE/actions/ide';
import { setLanguage } from '../IDE/actions/preferences';
import CookieConsent from '../User/components/CookieConsent';

function hideCookieConsent(pathname) {
  if (pathname.includes('/full/') || pathname.includes('/embed/')) {
    return true;
  }
  return false;
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isMounted: false
    };
  }

  componentDidMount() {
    this.setState({ isMounted: true }); // eslint-disable-line react/no-did-mount-set-state
    document.body.className = this.props.theme;
  }

  componentDidUpdate(prevProps) {
    if (this.props.theme !== prevProps.theme) {
      document.body.className = this.props.theme;
    }

    const locationWillChange = this.props.location !== prevProps.location;
    const shouldSkipRemembering =
      this.props.location.state &&
      this.props.location.state.skipSavingPath === true;

    if (locationWillChange && !shouldSkipRemembering) {
      this.props.setPreviousPath(prevProps.location.pathname);
    }

    if (prevProps.language !== this.props.language) {
      this.props.setLanguage(this.props.language, { persistPreference: false });
    }
  }

  render() {
    const hide = hideCookieConsent(this.props.location.pathname);
    return (
      <div className="app">
        <CookieConsent hide={hide} />
        {this.state.isMounted &&
          !window.devToolsExtension &&
          getConfig('NODE_ENV') === 'development' && <DevTools />}
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
      skipSavingPath: PropTypes.bool
    })
  }).isRequired,
  setPreviousPath: PropTypes.func.isRequired,
  setLanguage: PropTypes.func.isRequired,
  language: PropTypes.string,
  theme: PropTypes.string
};

App.defaultProps = {
  children: null,
  language: null,
  theme: 'light'
};

const mapStateToProps = (state) => ({
  theme: state.preferences.theme,
  language: state.preferences.language
});

const mapDispatchToProps = { setPreviousPath, setLanguage };

export default connect(mapStateToProps, mapDispatchToProps)(App);
