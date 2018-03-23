import InlineSVG from 'react-inlinesvg';
import PropTypes from 'prop-types';
import React from 'react';

const googleUrl = require('../../../images/google.svg');

function GoogleButton(props) {
  return (
    <a
      className="google-button"
      href="/auth/google/callback"
    >
      <InlineSVG src={googleUrl} className="google-icon" />
      <span>{props.buttonText}</span>
    </a>
  );
}

GoogleButton.propTypes = {
  buttonText: PropTypes.string.isRequired
};

export default GoogleButton;
