import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { browserHistory } from 'react-router';
import InlineSVG from 'react-inlinesvg';
import { Helmet } from 'react-helmet';
import { addApiKey, removeApiKey } from '../actions';
import APIKeyForm from '../components/APIKeyForm';

const exitUrl = require('../../../images/exit.svg');
const logoUrl = require('../../../images/p5js-logo.svg');

class AdvancedSettingsView extends React.Component {
  constructor(props) {
    super(props);
    this.closeAccountPage = this.closeAccountPage.bind(this);
    this.gotoHomePage = this.gotoHomePage.bind(this);
  }

  componentDidMount() {
    document.body.className = this.props.theme;
  }

  closeAccountPage() {
    browserHistory.goBack();
  }

  gotoHomePage() {
    browserHistory.push('/');
  }

  render() {
    return (
      <div className="form-container">
        <Helmet>
          <title>p5.js Web Editor | Advanced Settings</title>
        </Helmet>
        <div className="form-container__header">
          <button className="form-container__logo-button" onClick={this.gotoHomePage}>
            <InlineSVG src={logoUrl} alt="p5js Logo" />
          </button>
          <button className="form-container__exit-button" onClick={this.closeAccountPage}>
            <InlineSVG src={exitUrl} alt="Close Account Page" />
          </button>
        </div>
        <div className="form-container__content">
          <h2 className="form-container__title">Advanced Settings</h2>
          <APIKeyForm {...this.props} />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    initialValues: state.user, // <- initialValues for reduxForm
    user: state.user,
    apiKeys: state.user.apiKeys,
    previousPath: state.ide.previousPath,
    theme: state.preferences.theme
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ addApiKey, removeApiKey }, dispatch);
}

AdvancedSettingsView.propTypes = {
  theme: PropTypes.string.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(AdvancedSettingsView);
