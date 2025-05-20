import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import {
  AboutPageContent,
  Intro,
  IntroHeadline,
  IntroDescription,
  Section,
  SectionContainer,
  SectionItem,
  Contact,
  ContactTitle,
  ContactHandles,
  Footer
} from '../About.styles';

import { ContactSectionLinks, AboutSectionInfo } from '../statics/aboutData';
import Nav from '../../IDE/components/Header/Nav';
import RootPage from '../../../components/RootPage';
import packageData from '../../../../package.json';

import HeartIcon from '../../../images/heart.svg';
import AsteriskIcon from '../../../images/p5-asterisk.svg';
import LogoIcon from '../../../images/p5js-square-logo.svg';

const AboutSection = ({ section, t }) => (
  <Section>
    <h2>{t(section.header)}</h2>
    <SectionContainer>
      {section.items.map((item) => (
        <SectionItem key={item.url}>
          <AsteriskIcon aria-hidden="true" focusable="false" />
          <div>
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              {t(item.title)}
            </a>
            <p>{t(item.description)}</p>
          </div>
        </SectionItem>
      ))}
    </SectionContainer>
  </Section>
);

const About = () => {
  const { t } = useTranslation();

  const p5version = useSelector((state) => {
    const index = state.files.find((file) => file.name === 'index.html');
    return index?.content.match(/\/p5\.js\/([\d.]+)\//)?.[1];
  });

  return (
    <RootPage>
      <Helmet>
        <title> {t('About.TitleHelmet')} </title>
      </Helmet>

      <Nav layout="dashboard" />

      <AboutPageContent>
        <Intro>
          <h1>{t('About.Title')}</h1>
          <IntroHeadline>
            <LogoIcon
              role="img"
              aria-label={t('Common.p5logoARIA')}
              focusable="false"
            />
            <div>
              <p>{t('About.Headline')}</p>
            </div>
          </IntroHeadline>
          <IntroDescription>
            <p>{t('About.IntroDescription1')}</p>
            <p>{t('About.IntroDescription2')}</p>
          </IntroDescription>
          <a
            href="https://p5js.org/donate/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <HeartIcon aria-hidden="true" focusable="false" />
            {t('About.Donate')}
          </a>
        </Intro>

        {AboutSectionInfo.map((section) => (
          <AboutSection key={t(section.header)} section={section} t={t} />
        ))}

        <Contact>
          <h2>{t('Contact')}</h2>
          <div>
            <ContactTitle>{t('About.Email')}</ContactTitle>
            <ContactHandles>
              <a
                href={t('About.EmailAddress')}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('About.EmailAddress')}
              </a>
            </ContactHandles>
          </div>
          <div>
            <ContactTitle>{t('About.Socials')}</ContactTitle>
            <ContactHandles>
              {ContactSectionLinks.map((item, index, array) => (
                <React.Fragment key={item.href}>
                  <a href={item.href} target="_blank" rel="noopener noreferrer">
                    {t(item.label)}
                  </a>
                  {index < array.length - 1 && ', '}
                </React.Fragment>
              ))}
            </ContactHandles>
          </div>
        </Contact>

        <Footer>
          <div>
            <Link to="/privacy-policy">{t('About.PrivacyPolicy')}</Link>
            <Link to="/terms-of-use">{t('About.TermsOfUse')}</Link>
            <Link to="/code-of-conduct">{t('About.CodeOfConduct')}</Link>
          </div>
          <p>
            {t('About.WebEditor')}: <span>v{packageData?.version}</span>
          </p>
          <p>
            p5.js: <span>v{p5version}</span>
          </p>
        </Footer>
      </AboutPageContent>
    </RootPage>
  );
};

AboutSection.propTypes = {
  section: PropTypes.shape({
    header: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        url: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired
      })
    ).isRequired
  }).isRequired,
  t: PropTypes.func.isRequired
};

export default About;
