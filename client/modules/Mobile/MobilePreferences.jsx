import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
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

const optionsOnOff = (name, onLabel = 'On', offLabel = 'Off') => [
  {
    value: true, label: onLabel, ariaLabel: `${name} on`, name: `${name}`, id: `${name}-on`.replace(' ', '-')
  },
  {
    value: false, label: offLabel, ariaLabel: `${name} off`, name: `${name}`, id: `${name}-off`.replace(' ', '-')
  },
];

const optionsPickOne = (name, ...options) => options.map(option => ({
  value: option,
  label: option,
  ariaLabel: `${option} ${name} on`,
  name: `${option} ${name}`,
  id: `${option}-${name}-on`.replace(' ', '-')
}));


const MobilePreferences = (props) => {
  const {
    setTheme, setAutosave, setLinewrap, setTextOutput, setGridOutput, setSoundOutput, lineNumbers, lintWarning
  } = props;
  const {
    theme, autosave, linewrap, textOutput, gridOutput, soundOutput, setLineNumbers, setLintWarning
  } = props;

  const generalSettings = [
    {
      title: 'Theme',
      value: theme,
      options: optionsPickOne('theme', 'light', 'dark', 'contrast'),
      onSelect: x => setTheme(x) // setTheme
    },

    {
      title: 'Autosave',
      value: autosave,
      options: optionsOnOff('autosave'),
      onSelect: x => setAutosave(x) // setAutosave
    },

    {
      title: 'Word Wrap',
      value: linewrap,
      options: optionsOnOff('linewrap'),
      onSelect: x => setLinewrap(x)
    }
  ];

  const outputSettings = [
    {
      title: 'Plain-text',
      value: textOutput,
      options: optionsOnOff('text output'),
      onSelect: x => setTextOutput(x)
    },
    {
      title: 'Table-text',
      value: gridOutput,
      options: optionsOnOff('table output'),
      onSelect: x => setGridOutput(x)
    },
    {
      title: 'Sound',
      value: soundOutput,
      options: optionsOnOff('sound output'),
      onSelect: x => setSoundOutput(x)
    },
  ];

  const accessibilitySettings = [
    {
      title: 'Line Numbers',
      value: lineNumbers,
      options: optionsOnOff('line numbers'),
      onSelect: x => setLineNumbers(x)
    },
    {
      title: 'Lint Warning Sound',
      value: lintWarning,
      options: optionsOnOff('lint warning'),
      onSelect: x => setLintWarning(x)
    },
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

const mapStateToProps = state => ({
  ...state.preferences,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  ...PreferencesActions,
  ...IdeActions
}, dispatch);


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MobilePreferences));
