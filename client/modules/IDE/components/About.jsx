import React from 'react';
import InlineSVG from 'react-inlinesvg';
import { Helmet } from 'react-helmet';

const squareLogoUrl = require('../../../images/p5js-square-logo.svg');
// const playUrl = require('../../../images/play.svg');
const asteriskUrl = require('../../../images/p5-asterisk.svg');

function About(props) {
  return (
    <div className="about__content">
      <Helmet>
        <title>p5.js Web Editor | About</title>
      </Helmet>
      <div className="about__content-column">
        <InlineSVG className="about__logo" src={squareLogoUrl} alt="p5js Square Logo" />
        {/* Video button to hello p5 video page */}
        {/* <p className="about__play-video">
          <a
            href="http://hello.p5js.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <InlineSVG className="about__play-video-button" src={playUrl} alt="Play Hello Video" />
          Play hello! video</a>
        </p>  */}
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
            href="https://p5js.org/learn/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <InlineSVG className="about__content-column-asterisk" src={asteriskUrl} alt="p5 asterisk" />
          Learn</a>
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
      </div>
    </div>
  );
}

export default About;
