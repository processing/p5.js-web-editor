import React from 'react';
import { useTranslation } from 'react-i18next';
import Legal from './Legal';

function CodeOfConduct() {
  const { t } = useTranslation();

  return (
    <Legal policyFile="code-of-conduct.md" title={t('Legal.CodeOfConduct')} />
  );
}

export default CodeOfConduct;
