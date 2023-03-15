import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import dates from '../../../utils/formatDate';
import useInterval from '../hooks/useInterval';
import { getIsUserOwner } from '../selectors/users';

const Timer = () => {
  const projectSavedTime = useSelector((state) => state.project.updatedAt);
  const isUserOwner = useSelector(getIsUserOwner);

  const { t } = useTranslation();

  const [timeAgo, setTimeAgo] = useState('');

  // Update immediately upon saving.
  useEffect(() => {
    setTimeAgo(
      projectSavedTime ? dates.distanceInWordsToNow(projectSavedTime) : ''
    );
  }, [projectSavedTime]);

  // Update every 10 seconds.
  useInterval(
    () =>
      setTimeAgo(
        projectSavedTime ? dates.distanceInWordsToNow(projectSavedTime) : ''
      ),
    10000
  );

  const timerClass = classNames({
    'timer__saved-time': true,
    'timer__saved-time--notOwner': !isUserOwner
  });

  return (
    <span className={timerClass}>
      {timeAgo ? t('Timer.SavedAgo', { timeAgo }) : null}
    </span>
  );
};

export default Timer;
