import React from 'react';
import { Link } from 'react-router';

class ResetPasswordView extends React.Component {
  componentDidMount() {
    this.refs.forgotPassword.focus();    
  }

  render() {
    return (
      <div className="forgot-password" ref="forgotPassword" tabIndex="0">
        <h1>Forgot Password</h1>
        <Link className="form__login-button" to="/login">Login</Link>
        or
        <Link className="form__signup-button" to="/signup">Sign up</Link>
        <Link className="form__cancel-button" to="/">Cancel</Link>
      </div>
    );
  }
}