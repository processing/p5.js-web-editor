import React, { PropTypes } from 'react';
import InlineSVG from 'react-inlinesvg';
import { browserHistory } from 'react-router';

const exitUrl = require('../../../images/exit.svg');
const squareLogoUrl = require('../../../images/p5js-square-logo.svg');
const playUrl = require('../../../images/play.svg');
const asteriskUrl = require('../../../images/p5-asterisk.svg');

class About extends React.Component {
  constructor(props) {
    super(props);
    this.closeAboutModal = this.closeAboutModal.bind(this);
  }

  componentDidMount() {
    this.aboutSection.focus();
  }

  closeAboutModal() {
    browserHistory.push(this.props.previousPath);
  }

  render() {
    return (
      <section className="about" ref={(element) => { this.aboutSection = element; }} tabIndex="0">
        <header className="about__header">
          <h2 className="about__header-title">Welcome</h2>
          <button className="about__exit-button" onClick={this.closeAboutModal}>
            <InlineSVG src={exitUrl} alt="Close About Overlay" />
          </button>
        </header>
        <div className="about__content">
          <div className="about__content-column">
            <InlineSVG className="about__logo" src={squareLogoUrl} alt="p5js Square Logo" />
            <p className="about__play-video">
              <a
                href="http://hello.p5js.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <InlineSVG className="about__play-video-button" src={playUrl} alt="Play Hello Video" />
              Play hello! video</a>
            </p>
          </div>
          <div className="about__content-column">
            <h3 className="about__content-column-title">New to p5.js?</h3>
            <p className="about__content-column-list">
              <a
                href="https://p5js.org/examples/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <InlineSVG className="about__content-column-asterisk" src={asteriskUrl} alt="p5 asterisk" />
              Examples</a>
            </p>
            <p className="about__content-column-list">
              <a
                href="https://p5js.org/tutorials/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <InlineSVG className="about__content-column-asterisk" src={asteriskUrl} alt="p5 asterisk" />
              Tutorials</a>
            </p>
          </div>
          <div className="about__content-column">
            <h3 className="about__content-column-title">Resources</h3>
            <p className="about__content-column-list">
              <a
                href="https://p5js.org/libraries/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <InlineSVG className="about__content-column-asterisk" src={asteriskUrl} alt="p5 asterisk" />
              Libraries</a>
            </p>
            <p className="about__content-column-list">
              <a
                href="https://p5js.org/reference/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <InlineSVG className="about__content-column-asterisk" src={asteriskUrl} alt="p5 asterisk" />
              Reference</a>
            </p>
            <p className="about__content-column-list">
              <a
                href="https://forum.processing.org/two/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <InlineSVG className="about__content-column-asterisk" src={asteriskUrl} alt="p5 asterisk" />
              Forum</a>
            </p>
          </div>
        </div>
        <div className="about__footer">
          <p className="about__footer-list">
            <a
              href="https://github.com/processing/p5.js-web-editor"
              target="_blank"
              rel="noopener noreferrer"
            >Contribute</a>
          </p>
          <p className="about__footer-list">
            <a
              href="https://github.com/processing/p5.js-web-editor/issues/new"
              target="_blank"
              rel="noopener noreferrer"
            >Report a bug</a>
          </p>
          <p className="about__footer-list">
            <a
              href="https://twitter.com/p5xjs?lang=en"
              target="_blank"
              rel="noopener noreferrer"
            >Twitter</a>
          </p>
          <button className="about__ok-button" onClick={this.closeAboutModal}>OK!</button>
        </div>
      </section>
    );
  }
}

About.propTypes = {
  previousPath: PropTypes.string.isRequired
};

export default About;
