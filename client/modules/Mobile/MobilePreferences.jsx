import React from 'react';
import { useTranslation } from 'react-i18next';

import styled from 'styled-components';
import { ExitIcon } from '../../common/icons';
import Header from '../../components/mobile/Header';

import IconButton from '../../components/mobile/IconButton';
import Screen from '../../components/mobile/MobileScreen';
import { remSize } from '../../theme';
import Preferences from '../IDE/components/Preferences';

const PreferencesContent = styled(Preferences)`
  margin-left: auto;
  margin-right: auto;
  padding-top: ${remSize(84)};
  height: 100vh;
  max-height: 100vh;
`;

const MobilePreferences = () => {
  const { t } = useTranslation();

  return (
    <Screen>
      <section>
        <Header transparent title={t('MobileIDEView.Preferences')}>
          <IconButton to="/" icon={ExitIcon} aria-label={t('Nav.BackEditor')} />
        </Header>
        <PreferencesContent />
      </section>
    </Screen>
  );
};

export default MobilePreferences;
