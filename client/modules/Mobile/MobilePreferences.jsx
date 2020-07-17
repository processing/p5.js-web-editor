import React from 'react';
import { bindActionCreators } from 'redux';
import { connect, useSelector, useDispatch } from 'react-redux';
import { withRouter } from 'react-router';
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
import { optionsOnOff, optionsPickOne, preferenceOnOff } from '../../common/helpers/PreferenceCreators';

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


  const generalSettings = [
    {
      title: 'Theme',
      value: theme,
      options: optionsPickOne('theme', 'light', 'dark', 'contrast'),
      onSelect: x => setTheme(x) // setTheme
    },
    preferenceOnOff('Autosave', autosave, setAutosave, 'autosave'),
    preferenceOnOff('Word Wrap', linewrap, setLinewrap, 'linewrap')
  ];

  const outputSettings = [
    preferenceOnOff('Plain-text', textOutput, setTextOutput, 'text output'),
    preferenceOnOff('Table-text', gridOutput, setGridOutput, 'table output'),
    preferenceOnOff('Lint Warning Sound', soundOutput, setSoundOutput, 'sound output')
  ];

  const accessibilitySettings = [
    preferenceOnOff('Line Numbers', lineNumbers, setLineNumbers),
    preferenceOnOff('Lint Warning Sound', lintWarning, setLintWarning)
  ];

  return (
    <Screen fullscreen>
      <section>
        <Header transparent title="Preferences">
          <IconButton to="/mobile" icon={ExitIcon} aria-label="Return to ide view" />
        </Header>
        <section className="preferences">
          <Content>
            <SectionHeader>General Settings</SectionHeader>
            { generalSettings.map(option => <PreferencePicker key={`${option.title}wrapper`} {...option} />) }

            <SectionHeader>Accessibility</SectionHeader>
            { accessibilitySettings.map(option => <PreferencePicker key={`${option.title}wrapper`} {...option} />) }

            <SectionHeader>Accessible Output</SectionHeader>
            <SectionSubeader>Used with screen reader</SectionSubeader>
            { outputSettings.map(option => <PreferencePicker key={`${option.title}wrapper`} {...option} />) }

          </Content>
        </section>
      </section>
    </Screen>);
};


MobilePreferences.propTypes = {
  fontSize: PropTypes.number.isRequired,
  lineNumbers: PropTypes.bool.isRequired,
  autosave: PropTypes.bool.isRequired,
  linewrap: PropTypes.bool.isRequired,
  textOutput: PropTypes.bool.isRequired,
  gridOutput: PropTypes.bool.isRequired,
  soundOutput: PropTypes.bool.isRequired,
  lintWarning: PropTypes.bool.isRequired,
  theme: PropTypes.string.isRequired,

  setLinewrap: PropTypes.func.isRequired,
  setLintWarning: PropTypes.func.isRequired,
  setTheme: PropTypes.func.isRequired,
  setFontSize: PropTypes.func.isRequired,
  setLineNumbers: PropTypes.func.isRequired,
  setAutosave: PropTypes.func.isRequired,
  setTextOutput: PropTypes.func.isRequired,
  setGridOutput: PropTypes.func.isRequired,
  setSoundOutput: PropTypes.func.isRequired,
};

export default withRouter(MobilePreferences);
