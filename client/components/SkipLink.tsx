import React, { useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

interface SkipLinkProps {
  targetId: string;
  text: string;
}

export const SkipLink = ({ targetId, text }: SkipLinkProps) => {
  const [focus, setFocus] = useState(false);
  const { t } = useTranslation();
  const handleFocus = () => {
    setFocus(true);
  };

  const handleBlur = () => {
    setFocus(false);
  };
  const linkClasses = classNames('skip_link', { focus });

  return (
    <a
      href={`#${targetId}`}
      className={linkClasses}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {t(`SkipLink.${text}`)}
    </a>
  );
};
