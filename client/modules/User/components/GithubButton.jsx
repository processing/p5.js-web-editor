import InlineSVG from 'react-inlinesvg';
import React, { PropTypes } from 'react';

const githubUrl = require('../../../images/github.svg');

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
