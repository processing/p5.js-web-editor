import React from 'react';
import { useTranslation } from 'react-i18next';
import LogoIcon from '../../../images/p5js-logo.svg';
import PFLogoIcon from '../../../images/processing-foundation-logo.svg';

export default function FundraiserModal() {
  const { t } = useTranslation();

  return (
    <div className="fundraiser">
      <p className="fundraiser__description">{t('Fundraiser.Description')}</p>
      <div className="fundraiser__img-container">
        <LogoIcon
          className="fundraiser__logo-p5"
          role="img"
          aria-label={t('Common.p5logoARIA')}
          focusable="false"
        />
        <PFLogoIcon
          className="fundraiser__logo-PF"
          role="img"
          aria-label={t('Common.PFlogoARIA')}
          focusable="false"
        />
      </div>
      <a
        className="fundraiser__CTA"
        href="https://donorbox.org/to-the-power-of-10"
        target="_blank"
        rel="noopener noreferrer"
      >
        {t('Fundraiser.CallToAction')}
      </a>
    </div>
  );
}
