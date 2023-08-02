import React from 'react';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Link } from 'react-router';
import SquareLogoIcon from '../../../images/p5js-square-logo.svg';
// import PlayIcon from '../../../images/play.svg';
import AsteriskIcon from '../../../images/p5-asterisk.svg';
import packageData from '../../../../package.json';
import { remSize, prop } from '../../../theme';

const AboutContent = styled.div`
  &&& {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    flex-wrap: wrap;
    padding-top: ${remSize(17)};
    padding-right: ${remSize(78)};
    padding-bottom: ${remSize(20)};
    padding-left: ${remSize(20)};
    width: ${remSize(720)};
  }

  @media (max-width: 768px) {
    &&& {
      flex-direction: column;
      overflow-y: auto;
      overflow-x: hidden;
      width: 100%;
      margin-right: ${remSize(15)};
    }
  }
`;

const AboutContentColumn = styled.div`
  &&& {
    display: flex;
    flex-direction: column;
    margin-left: 15px;
    margin-right: 15px;
  }
`;

const AboutContentColumnTitle = styled.h3`
  &&& {
    font-size: ${remSize(21)};
    padding-left: ${remSize(17)};
  }
`;

const AboutContentColumnAsterisk = styled(AsteriskIcon)`
  &&& {
    padding-right: ${remSize(5)};
    & path {
      fill: ${prop('logoColor')};
      stroke: ${prop('logoColor')};
    }
  }
`;

const AboutContentColumnList = styled.p`
  &&& {
    padding-top: ${remSize(10)};
    font-size: ${remSize(16)};
  }
`;

const AboutVersionInfo = styled.p`
  &&& {
    padding-top: ${remSize(8)};
    font-size: ${remSize(16)};
    span {
      color: ${prop('logoColor')};
    }
  }
  &:first-child {
    &&& {
      padding-top: ${remSize(30)};
    }
  }
`;

const AboutFooter = styled.div`
  &&& {
    display: flex;
    justify-content: space-between;
    padding-top: ${remSize(18)};
    padding-right: ${remSize(20)};
    padding-bottom: ${remSize(21)};
    padding-left: ${remSize(20)};
    width: 100%;
  }

  @media (max-width: 768px) {
    &&& {
      flex-direction: column;
      padding-left: ${remSize(20)};
      padding-right: ${remSize(20)};
    }
  }
`;

const AboutFooterList = styled.p`
  &&& {
    padding-top: ${remSize(12)};
  }
`;

const AboutLogo = styled(SquareLogoIcon)`
  &&& {
    & path {
      fill: ${prop('logoColor')};
    }
  }
`;

function About(props) {
  const { t } = useTranslation();
  const p5version = useSelector((state) => {
    const index = state.files.find((file) => file.name === 'index.html');
    return index?.content.match(/\/p5\.js\/([\d.]+)\//)?.[1];
  });

  return (
    <AboutContent>
      <Helmet>
        <title> {t('About.TitleHelmet')} </title>
      </Helmet>
      <AboutContentColumn>
        <SquareLogoIcon
          as={AboutLogo}
          role="img"
          aria-label={t('Common.p5logoARIA')}
          focusable="false"
        />
        <AboutContentColumn>
          <AboutVersionInfo>
            Web Editor: <span>v{packageData?.version}</span>
          </AboutVersionInfo>
          <AboutVersionInfo>
            p5.js: <span>v{p5version}</span>
          </AboutVersionInfo>
        </AboutContentColumn>
      </AboutContentColumn>
      <AboutContentColumn>
        <AboutContentColumnTitle>{t('About.NewP5')}</AboutContentColumnTitle>
        <AboutContentColumnList>
          <a href="https://p5js.org/" target="_blank" rel="noopener noreferrer">
            <AsteriskIcon
              as={AboutContentColumnAsterisk}
              aria-hidden="true"
              focusable="false"
            />
            Home
          </a>
        </AboutContentColumnList>
        <AboutContentColumnList>
          <a
            href="https://p5js.org/examples/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <AsteriskIcon
              as={AboutContentColumnAsterisk}
              aria-hidden="true"
              focusable="false"
            />
            {t('About.Examples')}
          </a>
        </AboutContentColumnList>
        <AboutContentColumnList>
          <a
            href="https://p5js.org/learn/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <AsteriskIcon
              as={AboutContentColumnAsterisk}
              aria-hidden="true"
              focusable="false"
            />
            {t('About.Learn')}
          </a>
        </AboutContentColumnList>
        <AboutContentColumnList>
          <a
            href="https://twitter.com/p5xjs?lang=en"
            target="_blank"
            rel="noopener noreferrer"
          >
            <AsteriskIcon
              as={AboutContentColumnAsterisk}
              aria-hidden="true"
              focusable="false"
            />
            Twitter
          </a>
        </AboutContentColumnList>
        <AboutContentColumnList>
          <a
            href="https://www.instagram.com/p5xjs/?hl=en"
            target="_blank"
            rel="noopener noreferrer"
          >
            <AsteriskIcon
              as={AboutContentColumnAsterisk}
              aria-hidden="true"
              focusable="false"
            />
            Instagram
          </a>
        </AboutContentColumnList>
      </AboutContentColumn>
      <AboutContentColumn>
        <AboutContentColumnTitle>
          {t('About.Resources')}
        </AboutContentColumnTitle>
        <AboutContentColumnList>
          <a
            href="https://p5js.org/libraries/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <AsteriskIcon
              as={AboutContentColumnAsterisk}
              aria-hidden="true"
              focusable="false"
            />
            {t('About.Libraries')}
          </a>
        </AboutContentColumnList>
        <AboutContentColumnList>
          <a
            href="https://p5js.org/reference/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <AsteriskIcon
              as={AboutContentColumnAsterisk}
              aria-hidden="true"
              focusable="false"
            />
            {t('Nav.Help.Reference')}
          </a>
        </AboutContentColumnList>
        <AboutContentColumnList>
          <a
            href="https://discourse.processing.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <AsteriskIcon
              as={AboutContentColumnAsterisk}
              aria-hidden="true"
              focusable="false"
            />
            {t('About.Forum')}
          </a>
        </AboutContentColumnList>
        <AboutContentColumnList>
          <a
            href="https://discord.com/invite/SHQ8dH25r9"
            target="_blank"
            rel="noopener noreferrer"
          >
            <AsteriskIcon
              as={AboutContentColumnAsterisk}
              aria-hidden="true"
              focusable="false"
            />
            Discord
          </a>
        </AboutContentColumnList>
        <AboutContentColumnList>
          <Link to="/privacy-policy">
            <AsteriskIcon
              as={AboutContentColumnAsterisk}
              aria-hidden="true"
              focusable="false"
            />
            {t('About.PrivacyPolicy')}
          </Link>
        </AboutContentColumnList>
        <AboutContentColumnList>
          <Link to="/terms-of-use">
            <AsteriskIcon
              as={AboutContentColumnAsterisk}
              aria-hidden="true"
              focusable="false"
            />
            {t('About.TermsOfUse')}
          </Link>
        </AboutContentColumnList>
        <AboutContentColumnList>
          <Link to="/code-of-conduct">
            <AsteriskIcon
              as={AboutContentColumnAsterisk}
              aria-hidden="true"
              focusable="false"
            />
            {t('About.CodeOfConduct')}
          </Link>
        </AboutContentColumnList>
      </AboutContentColumn>
      <AboutContentColumn>
        <AboutFooter>
          <AboutFooterList>
            <a
              href="https://github.com/processing/p5.js-web-editor"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('About.Contribute')}
            </a>
          </AboutFooterList>
          <AboutFooterList>
            <a
              href="https://github.com/processing/p5.js-web-editor/issues/new"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('About.Report')}
            </a>
          </AboutFooterList>
        </AboutFooter>
      </AboutContentColumn>
    </AboutContent>
  );
}

export default About;
