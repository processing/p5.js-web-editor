import React from 'react';
import InlineSVG from 'react-inlinesvg';
const exitUrl = require('../../../images/exit.svg');
import { browserHistory } from 'react-router';

class About extends React.Component {
  closeAboutModal() {
    browserHistory.goBack();
  }

  render() {
    return (
      <div className="about">
        <header className="about__header">
          <h2>About</h2>
          <button className="about__exit-button" onClick={this.closeAboutModal}>
            <InlineSVG src={exitUrl} alt="Close About Overlay" />
          </button>
        </header>
        <div className="about__copy">
          <p>
            The p5.js Web Editor is an open source project.
          </p>
          <p>
            <a
              href="https://github.com/processing/p5.js-web-editor"
              target="_blank"
            >Contribute </a>
            or
            <a
              href="https://github.com/processing/p5.js-web-editor/issues/new"
              target="_blank"
            > report a bug.</a>
          </p>
        </div>
      </div>
    );
  }
}

export default About;
