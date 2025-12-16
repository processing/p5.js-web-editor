import React from 'react';
import { useTranslation } from 'react-i18next';
import { Legal } from './Legal';

export function CodeOfConduct() {
  const { t } = useTranslation();

  return (
    <Legal policyFile="code-of-conduct.md" title={t('Legal.CodeOfConduct')} />
  );
}
