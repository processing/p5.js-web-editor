import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';
import { withTranslation } from 'react-i18next';

class ErrorModal extends React.Component {
  forceAuthentication() {
    return (
      <p>
        {this.props.t('ErrorModal.MessageLogin')}
        <Link to="/login" onClick={this.props.closeModal}> {this.props.t('ErrorModal.Login')}</Link>
        {this.props.t('ErrorModal.LoginOr')}
        <Link to="/signup" onClick={this.props.closeModal}>{this.props.t('ErrorModal.SignUp')}</Link>.
      </p>
    );
  }

  staleSession() {
    return (
      <p>
        {this.props.t('ErrorModal.MessageLoggedOut')}
        <Link to="/login" onClick={this.props.closeModal}>{this.props.t('ErrorModal.LogIn')}</Link>.
      </p>
    );
  }

  staleProject() {
    return (
      <p>
        {this.props.t('ErrorModal.SavedDifferentWindow')}
      </p>
    );
  }

  render() {
    return (
      <div className="error-modal__content">
        {(() => { // eslint-disable-line
          if (this.props.type === 'forceAuthentication') {
            return this.forceAuthentication();
          } else if (this.props.type === 'staleSession') {
            return this.staleSession();
          } else if (this.props.type === 'staleProject') {
            return this.staleProject();
          }
        })()}
      </div>
    );
  }
}

ErrorModal.propTypes = {
  type: PropTypes.string.isRequired,
  closeModal: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired
};

export default withTranslation()(ErrorModal);
