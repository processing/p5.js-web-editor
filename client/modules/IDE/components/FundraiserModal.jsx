import React from 'react';
import { useTranslation } from 'react-i18next';
import SquareLogoIcon from '../../../images/p5js-square-logo.svg';

export default function FundraiserModal() {
  const { t } = useTranslation();

  return (
    <div className="fundraiser">
      <p className="fundraiser__description">{t('Fundraiser.Description')}</p>
      <SquareLogoIcon
        className="about__logo"
        role="img"
        aria-label={t('Common.p5logoARIA')}
        focusable="false"
      />
      <p className="fundraiser__description">{t('Fundraiser.CallToAction')}</p>
    </div>
  );
}
