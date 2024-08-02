import React, { useState } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const SkipLink = ({ targetId, text }) => {
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

SkipLink.propTypes = {
  targetId: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired
};

export default SkipLink;
