import React from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import SquareLogoIcon from '../../../images/p5js-square-logo.svg';
// import PlayIcon from '../../../images/play.svg';
import AsteriskIcon from '../../../images/p5-asterisk.svg';
import { remSize } from '../../../theme';

const AboutLogo = styled(SquareLogoIcon)`
  & path {
    fill: ${({ theme }) => theme.logoColor.default.fill};
  }
`;

const AboutContentContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: wrap;
  padding-top: ${remSize(17)};
  padding-right: ${remSize(78)};
  padding-bottom: ${remSize(20)};
  padding-left: ${remSize(20)};
  width: ${remSize(720)};
`;

const AboutContentColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

const AboutContentColumnTitle = styled.h3`
  font-size: ${remSize(21)};
  padding-left: ${remSize(17)};
`;

const AboutContentColumnAsterisk = styled(AsteriskIcon)`
  &&& {
    padding-right: ${remSize(5)};
    & path {
      fill: ${({ theme }) => theme.logoColor.default.fill};
      stroke: ${({ theme }) => theme.logoColor.default.stroke};
    }
  }
`;

const AboutContentColumnList = styled.p`
  padding-top: ${remSize(10)};
  font-size: ${remSize(16)};
`;

const AboutFooter = styled.div`
  display: flex;
  justify-content: space-between;
  padding-top: ${remSize(18)};
  padding-right: ${remSize(20)};
  padding-bottom: ${remSize(21)};
  padding-left: ${remSize(291)};
  width: 100%;
`;

const AboutFooterList = styled.p`
  padding-top: ${remSize(12)};
`;

function About(props) {
  const { t } = useTranslation();
  return (
    <AboutContentContainer>
      <Helmet>
        <title> {t('About.TitleHelmet')} </title>
      </Helmet>
      <AboutContentColumn>
        <AboutLogo
          role="img"
          aria-label={t('Common.p5logoARIA')}
          focusable="false"
        />
      </AboutContentColumn>
      <AboutContentColumn>
        <AboutContentColumnTitle>{t('About.NewP5')}</AboutContentColumnTitle>
        <AboutContentColumnList>
          <a
            href="https://p5js.org/examples/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <AboutContentColumnAsterisk aria-hidden="true" focusable="false" />
            {t('About.Examples')}
          </a>
        </AboutContentColumnList>
        <AboutContentColumnList>
          <a
            href="https://p5js.org/learn/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <AboutContentColumnAsterisk aria-hidden="true" focusable="false" />
            {t('About.Learn')}
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
            <AboutContentColumnAsterisk aria-hidden="true" focusable="false" />
            {t('About.Libraries')}
          </a>
        </AboutContentColumnList>
        <AboutContentColumnList>
          <a
            href="https://p5js.org/reference/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <AboutContentColumnAsterisk aria-hidden="true" focusable="false" />
            {t('Nav.Help.Reference')}
          </a>
        </AboutContentColumnList>
        <AboutContentColumnList>
          <a
            href="https://discourse.processing.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <AboutContentColumnAsterisk aria-hidden="true" focusable="false" />
            {t('About.Forum')}
          </a>
        </AboutContentColumnList>
      </AboutContentColumn>
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
        <AboutFooterList>
          <a
            href="https://twitter.com/p5xjs?lang=en"
            target="_blank"
            rel="noopener noreferrer"
          >
            Twitter
          </a>
        </AboutFooterList>
      </AboutFooter>
    </AboutContentContainer>
  );
}

export default About;
