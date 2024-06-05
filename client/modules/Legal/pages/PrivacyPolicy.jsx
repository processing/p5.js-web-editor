import React from 'react';
import { useTranslation } from 'react-i18next';
import Legal from './Legal';

function PrivacyPolicy() {
  const { t } = useTranslation();

  return (
    <Legal policyFile="privacy-policy.md" title={t('Legal.PrivacyPolicy')} />
  );
}

export default PrivacyPolicy;
