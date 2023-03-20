import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import Helmet from 'react-helmet';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import styled from 'styled-components';
import Nav from '../../../components/Nav';
import RootPage from '../../../components/RootPage';
import { remSize } from '../../../theme';
import EmbedFrame from '../../Preview/EmbedFrame';

const NotFoundMain = styled.main`
  & .header {
    height: ${remSize(200)};
    width: 100%;
    z-index: 1;
    background: white;
    color: #ed225d;
    font-family: Montserrat, sans-serif;
    text-align: center;
    display: table;
  }
  & h1 {
    font-size: ${remSize(32)};
  }
  & .message-container {
    display: table-cell;
    vertical-align: middle;
  }
  & .message {
    color: #6b6b6b;
    margin: ${remSize(10)};
    font-weight: bold;
  }
  & .home-link {
    color: #b5b5b5;
    text-decoration: none;
  }
  & .sketch-info {
    height: ${remSize(30)};
    display: flex;
    padding-inline-start: ${remSize(10)};
  }
`;

async function getRandomProject(username) {
  // Find example projects
  const response = await axios.get(`/editor/${username}/projects`);
  const projects = response.data;
  if (!projects.length) return null;

  // Choose a random sketch
  const randomIndex = Math.floor(Math.random() * projects.length);
  return projects[randomIndex];
}

const username = 'p5';

export default function NotFound() {
  const { t } = useTranslation();

  const [sketch, setSketch] = useState(null);

  useEffect(() => {
    getRandomProject(username).then((project) => setSketch(project));
  }, []);

  const files = useMemo(() => {
    const instanceMode = (sketch?.files || [])
      .find((file) => file.name === 'sketch.js')
      ?.content?.includes('Instance Mode');

    return (sketch?.files || []).map((file) => ({
      ...file,
      content: file.content
        // Fix links to assets
        .replace(
          /'assets/g,
          "'https://github.com/processing/p5.js-website/raw/main/src/data/examples/assets"
        )
        .replace(
          /"assets/g,
          '"https://github.com/processing/p5.js-website/raw/main/src/data/examples/assets'
        )
        // Change canvas size
        .replace(
          /createCanvas\(\d+, ?\d+/g,
          instanceMode
            ? 'createCanvas(p.windowWidth, p.windowHeight'
            : 'createCanvas(windowWidth, windowHeight'
        )
    }));
  }, [sketch]);

  return (
    <RootPage>
      <Nav layout="dashboard" />
      <Helmet>
        <title>{t('NotFound.Title')}</title>
      </Helmet>
      <NotFoundMain>
        <div className="header">
          <div className="message-container">
            <h1>{t('NotFound.404PageNotFound')}</h1>
            <h6 className="message">{t('NotFound.DoesNotExist')}</h6>
            <h6 className="message">
              <Trans
                i18nKey="NotFound.CheckURL"
                components={[<Link to="/" className="home-link" />]}
              />
            </h6>
          </div>
        </div>
        {sketch ? (
          <div className="sketch-info nav preview-nav">
            <div className="nav__items-left">
              <Link
                className="nav__item"
                to={`/${username}/sketches/${sketch.id}`}
              >
                {sketch.name}
              </Link>
              <span className="toolbar__project-owner">{t('Toolbar.By')}</span>
              <Link className="nav__item" to={`/${username}/sketches/`}>
                {username}
              </Link>
            </div>
          </div>
        ) : null}
      </NotFoundMain>
      {sketch ? (
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: window.innerHeight - (200 + 42 + 30)
          }}
        >
          <EmbedFrame
            files={files}
            textOutput={false}
            gridOutput={false}
            isPlaying
            basePath={window.location.pathname}
          />
        </div>
      ) : null}
    </RootPage>
  );
}
