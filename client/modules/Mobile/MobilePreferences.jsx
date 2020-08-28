import React from 'react';
import { bindActionCreators } from 'redux';
import { connect, useSelector, useDispatch } from 'react-redux';
import { withRouter } from 'react-router';
import { useTranslation } from 'react-i18next';

import PropTypes from 'prop-types';
import styled from 'styled-components';

import * as PreferencesActions from '../IDE/actions/preferences';
import * as IdeActions from '../IDE/actions/ide';

import IconButton from '../../components/mobile/IconButton';
import Screen from '../../components/mobile/MobileScreen';
import Header from '../../components/mobile/Header';
import PreferencePicker from '../../components/mobile/PreferencePicker';
import { ExitIcon } from '../../common/icons';
import { remSize, prop } from '../../theme';
import { optionsOnOff, optionsPickOne, preferenceOnOff } from '../IDE/components/Preferences/PreferenceCreators';

const Content = styled.div`
  z-index: 0;
  margin-top: ${remSize(68)};
`;

const SectionHeader = styled.h2`
  color: ${prop('primaryTextColor')};
  padding-top: ${remSize(32)};
`;

const SectionSubeader = styled.h3`
  color: ${prop('primaryTextColor')};
`;


const MobilePreferences = () => {
  // Props
  const {
    theme, autosave, linewrap, textOutput, gridOutput, soundOutput, lineNumbers, lintWarning
  } = useSelector(state => state.preferences);

  // Actions
  const {
    setTheme, setAutosave, setLinewrap, setTextOutput, setGridOutput, setSoundOutput, setLineNumbers, setLintWarning,
  } = bindActionCreators({ ...PreferencesActions, ...IdeActions }, useDispatch());

  const { t } = useTranslation();

  const generalSettings = [
    {
      title: t('MobilePreferences.Theme'),
      value: theme,
      options: optionsPickOne(
        t('MobilePreferences.Theme'),
        t('MobilePreferences.LightTheme'),
        t('MobilePreferences.DarkTheme'),
        t('MobilePreferences.HighContrastTheme')
      ),
      onSelect: x => setTheme(x) // setTheme
    },
    preferenceOnOff(t('MobilePreferences.Autosave'), autosave, setAutosave, 'autosave'),
    preferenceOnOff(t('MobilePreferences.WordWrap'), linewrap, setLinewrap, 'linewrap')
  ];

  const outputSettings = [
    preferenceOnOff(t('MobilePreferences.PlainText'), textOutput, setTextOutput, 'text output'),
    preferenceOnOff(t('MobilePreferences.TableText'), gridOutput, setGridOutput, 'table output'),
    preferenceOnOff(t('MobilePreferences.Sound'), soundOutput, setSoundOutput, 'sound output')
  ];

  const accessibilitySettings = [
    preferenceOnOff(t('MobilePreferences.LineNumbers'), lineNumbers, setLineNumbers),
    preferenceOnOff(t('MobilePreferences.LintWarningSound'), lintWarning, setLintWarning)
  ];

  return (
    <Screen fullscreen>
      <section>
        <Header transparent title="Preferences">
          <IconButton to="/" icon={ExitIcon} aria-label="Return to ide view" />
        </Header>
        <section className="preferences">
          <Content>
            <SectionHeader>{t('MobilePreferences.GeneralSettings')}</SectionHeader>
            { generalSettings.map(option => <PreferencePicker key={`${option.title}wrapper`} {...option} />) }

            <SectionHeader>{t('MobilePreferences.Accessibility')}</SectionHeader>
            { accessibilitySettings.map(option => <PreferencePicker key={`${option.title}wrapper`} {...option} />) }

            <SectionHeader>{t('MobilePreferences.AccessibleOutput')}</SectionHeader>
            <SectionSubeader>{t('MobilePreferences.UsedScreenReader')}</SectionSubeader>
            { outputSettings.map(option => <PreferencePicker key={`${option.title}wrapper`} {...option} />) }

          </Content>
        </section>
      </section>
    </Screen>);
};

export default withRouter(MobilePreferences);
