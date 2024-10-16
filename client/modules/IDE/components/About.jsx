import React from 'react';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import SquareLogoIcon from '../../../images/p5js-square-logo.svg';
// import PlayIcon from '../../../images/play.svg';
import AsteriskIcon from '../../../images/p5-asterisk.svg';
import packageData from '../../../../package.json';

function About(props) {
  const { t } = useTranslation();
  const p5version = useSelector((state) => {
    const index = state.files.find((file) => file.name === 'index.html');
    return index?.content.match(/\/p5\.js\/([\d.]+)\//)?.[1];
  });
  return (
    <div className="about__content">
      <Helmet>
        <title> {t('About.TitleHelmet')} </title>
      </Helmet>
      <div className="about__content-column">
        <SquareLogoIcon
          className="about__logo"
          role="img"
          aria-label={t('Common.p5logoARIA')}
          focusable="false"
        />
        <div className="about__content-column">
          <p className="about__version-info">
            {t('About.WebEditor')}: <span>v{packageData?.version}</span>
          </p>
          <p className="about__version-info">
            p5.js: <span>v{p5version}</span>
          </p>
        </div>
      </div>
      <div className="about__content-column">
        <h3 className="about__content-column-title">{t('About.NewP5')}</h3>
        <p className="about__content-column-list">
          <a href="https://p5js.org/" target="_blank" rel="noopener noreferrer">
            <AsteriskIcon
              className="about__content-column-asterisk"
              aria-hidden="true"
              focusable="false"
            />
            {t('About.Home')}
          </a>
        </p>
        <p className="about__content-column-list">
          <a
            href="https://p5js.org/examples/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <AsteriskIcon
              className="about__content-column-asterisk"
              aria-hidden="true"
              focusable="false"
            />
            {t('About.Examples')}
          </a>
        </p>
        <p className="about__content-column-list">
          <a
            href="https://p5js.org/tutorials/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <AsteriskIcon
              className="about__content-column-asterisk"
              aria-hidden="true"
              focusable="false"
            />
            {t('About.Learn')}
          </a>
        </p>
        <p className="about__content-column-list">
          <a
            href="https://twitter.com/p5xjs?lang=en"
            target="_blank"
            rel="noopener noreferrer"
          >
            <AsteriskIcon
              className="about__content-column-asterisk"
              aria-hidden="true"
              focusable="false"
            />
            {t('About.Twitter')}
          </a>
        </p>
        <p className="about__content-column-list">
          <a
            href="https://www.instagram.com/p5xjs/?hl=en"
            target="_blank"
            rel="noopener noreferrer"
          >
            <AsteriskIcon
              className="about__content-column-asterisk"
              aria-hidden="true"
              focusable="false"
            />
            {t('About.Instagram')}
          </a>
        </p>
      </div>
      <div className="about__content-column">
        <h3 className="about__content-column-title">{t('About.Resources')}</h3>
        <p className="about__content-column-list">
          <a
            href="https://p5js.org/libraries/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <AsteriskIcon
              className="about__content-column-asterisk"
              aria-hidden="true"
              focusable="false"
            />
            {t('About.Libraries')}
          </a>
        </p>
        <p className="about__content-column-list">
          <a
            href="https://p5js.org/reference/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <AsteriskIcon
              className="about__content-column-asterisk"
              aria-hidden="true"
              focusable="false"
            />
            {t('Nav.Help.Reference')}
          </a>
        </p>
        <p className="about__content-column-list">
          <a
            href="https://discourse.processing.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <AsteriskIcon
              className="about__content-column-asterisk"
              aria-hidden="true"
              focusable="false"
            />
            {t('About.Forum')}
          </a>
        </p>
        <p className="about__content-column-list">
          <a
            href="https://discord.com/invite/SHQ8dH25r9"
            target="_blank"
            rel="noopener noreferrer"
          >
            <AsteriskIcon
              className="about__content-column-asterisk"
              aria-hidden="true"
              focusable="false"
            />
            {t('About.Discord')}
          </a>
        </p>
        <p className="about__content-column-list">
          <a
            href="https://p5js.org/donate/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <AsteriskIcon
              className="about__content-column-asterisk"
              aria-hidden="true"
              focusable="false"
            />
            Donate
          </a>
        </p>
        <p className="about__content-column-list">
          <Link to="/privacy-policy">
            <AsteriskIcon
              className="about__content-column-asterisk"
              aria-hidden="true"
              focusable="false"
            />
            {t('About.PrivacyPolicy')}
          </Link>
        </p>
        <p className="about__content-column-list">
          <Link to="/terms-of-use">
            <AsteriskIcon
              className="about__content-column-asterisk"
              aria-hidden="true"
              focusable="false"
            />
            {t('About.TermsOfUse')}
          </Link>
        </p>
        <p className="about__content-column-list">
          <Link to="/code-of-conduct">
            <AsteriskIcon
              className="about__content-column-asterisk"
              aria-hidden="true"
              focusable="false"
            />
            {t('About.CodeOfConduct')}
          </Link>
        </p>
      </div>
      <div className="about__footer">
        <p className="about__footer-list">
          <a
            href="https://github.com/processing/p5.js-web-editor"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('About.Contribute')}
          </a>
        </p>
        <p className="about__footer-list">
          <a
            href="https://github.com/processing/p5.js-web-editor/issues/new"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('About.Report')}
          </a>
        </p>
      </div>
    </div>
  );
}

export default About;
