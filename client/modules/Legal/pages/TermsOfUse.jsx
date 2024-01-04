import React from 'react';
import { useTranslation } from 'react-i18next';
import Legal from './Legal';

function TermsOfUse() {
  const { t } = useTranslation();

  return <Legal policyFile="terms-of-use.md" title={t('Legal.TermsOfUse')} />;
}

export default TermsOfUse;
