import InlineSVG from 'react-inlinesvg';
const githubUrl = require('../../../images/github.svg');
import React, { PropTypes } from 'react';

function GithubButton(props) {
  return (
    <a
      className="github-button"
      href="/auth/github"
    >
      <InlineSVG src={githubUrl} className="github-icon" />
      <span>{props.buttonText}</span>
    </a>
  );
}

GithubButton.propTypes = {
  buttonText: PropTypes.string.isRequired
};

export default GithubButton;
