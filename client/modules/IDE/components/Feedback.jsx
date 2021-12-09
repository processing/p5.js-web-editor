import React from 'react';
import { Helmet } from 'react-helmet';
import { withTranslation } from 'react-i18next';
import GitHubLogo from '../../../images/github.svg';

function Feedback(props) {
  return (
    <div className="feedback__content">
      <Helmet>
        <title>{this.props.t('Feedback.Title')}</title>
      </Helmet>
      <div className="feedback__content-pane">
        <h2 className="feedback__content-pane-header">Via Github Issues</h2>
        <p className="feedback__content-pane-copy">
          {`If you're familiar with Github, this is our preferred method for
            receiving bug reports and feedback.`}
        </p>
        <p className="feedback__content-pane-copy">
          <a
            href="https://github.com/processing/p5.js-web-editor/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            className="feedback__github-link"
          >
            Go to Github
            <GitHubLogo
              className="feedback__github-logo"
              focusable="false"
              aria-hidden="true"
            />
          </a>
        </p>
      </div>
      <div className="feedback__content-pane">
        <h2 className="feedback__content-pane-header">Via Google Form</h2>
        <p className="feedback__content-pane-copy">
          You can also submit this quick form.
        </p>
        <p className="feedback__content-pane-copy">
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSexU8W2EIhXjktl-_XzwjH6vgnelHirH4Yn4liN5BXltPWqBg/viewform"
            target="_blank"
            rel="noopener noreferrer"
          >
            Go to Form
          </a>
        </p>
      </div>
    </div>
  );
}

export default withTranslation()(Feedback);
