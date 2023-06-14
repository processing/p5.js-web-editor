import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Link } from 'react-router';
import { selectProjectOwner } from '../../selectors/project';

export default function ProjectOwner() {
  const { t } = useTranslation();

  const owner = useSelector(selectProjectOwner);

  if (!owner) return null;

  return (
    <p className="toolbar__project-owner">
      {t('Toolbar.By')}{' '}
      <Link to={`/${owner.username}/sketches`}>{owner.username}</Link>
    </p>
  );
}
