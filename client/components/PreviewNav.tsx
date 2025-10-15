import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import LogoIcon from '../images/p5js-logo-small.svg';
import CodeIcon from '../images/code.svg';

interface PreviewNavProps {
  owner: { username: string };
  project: { name: string; id: string };
}

export const PreviewNav = ({ owner, project }: PreviewNavProps) => {
  const { t } = useTranslation();
  return (
    <nav className="nav preview-nav" data-testid="preview-nav">
      <div className="nav__items-left" data-testid="nav-items-left">
        <div className="nav__item-logo" data-testid="nav-item-logo">
          <Link
            to={`/${owner.username}/sketches`}
            data-testid="icon-link_user-sketches"
          >
            <LogoIcon
              role="img"
              aria-label={t('Common.p5logoARIA')}
              focusable="false"
              className="svg__logo"
              data-testid="icon_p5-logo"
            />
          </Link>
        </div>
        <Link
          className="nav__item"
          to={`/${owner.username}/sketches/${project.id}`}
          data-testid="link_current-project"
        >
          {project.name}
        </Link>
        <p className="toolbar__project-owner">{t('PreviewNav.ByUser')}</p>
        <Link
          className="nav__item"
          to={`/${owner.username}/sketches`}
          data-testid="link_user-sketches"
        >
          {owner.username}
        </Link>
      </div>
      <div className="nav__items-right" data-testid="nav-items-right">
        <Link
          to={`/${owner.username}/sketches/${project.id}`}
          aria-label={t('PreviewNav.EditSketchARIA')}
          data-testid="link_project-code"
        >
          <CodeIcon
            className="preview-nav__editor-svg"
            focusable="false"
            aria-hidden="true"
            data-testid="icon_code"
          />
        </Link>
      </div>
    </nav>
  );
};
