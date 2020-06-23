import React, { useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import * as PreferencesActions from '../IDE/actions/preferences';
import * as IdeActions from '../IDE/actions/ide';

import Screen from '../../components/mobile/MobileScreen';
import Header from '../../components/mobile/Header';
import Selector from '../../components/mobile/Selector';
import { ExitIcon } from '../../common/icons';
import { remSize, prop } from '../../theme';

const IconLinkWrapper = styled(Link)`
  width: 3rem;
  margin-right: 1.25rem;
  margin-left: none;
`;

const Content = styled.div`
  z-index: 0;
  margin-top: ${remSize(68)};
`;


const SettingsHeader = styled(Header)`
  background: transparent
`;

const SectionHeader = styled.h2`
  color: ${prop('primaryTextColor')};
  padding-top: 2rem
`;


const MobilePreferences = (props) => {
  const {
    setTheme, setAutosave, setLinewrap, setTextOutput, setGridOutput, setSoundOutput
  } = props;
  const {
    theme, autosave, linewrap, textOutput, gridOutput, soundOutput
  } = props;

  const generalSettings = [
    {
      title: 'Theme',
      value: theme,
      options: [
        {
          value: 'light', label: 'light', ariaLabel: 'light theme on', name: 'light theme', id: 'light-theme-on'
        },
        {
          value: 'dark', label: 'dark', ariaLabel: 'dark theme on', name: 'dark theme', id: 'dark-theme-on'
        },
        {
          value: 'contrast', label: 'contrast', ariaLabel: 'contrast theme on', name: 'contrast theme', id: 'contrast-theme-on'
        }
      ],
      onSelect: x => setTheme(x) // setTheme
    },

    {
      title: 'Autosave',
      value: autosave,
      options: [
        {
          value: true, label: 'On', ariaLabel: 'autosave on', name: 'autosave', id: 'autosave-on'
        },
        {
          value: false, label: 'Off', ariaLabel: 'autosave off', name: 'autosave', id: 'autosave-off'
        },
      ],
      onSelect: x => setAutosave(x) // setAutosave
    },

    {
      title: 'Word Wrap',
      value: linewrap,
      options: [
        {
          value: true, label: 'On', ariaLabel: 'linewrap on', name: 'linewrap', id: 'linewrap-on'
        },
        {
          value: false, label: 'Off', ariaLabel: 'linewrap off', name: 'linewrap', id: 'linewrap-off'
        },
      ],
      onSelect: x => setLinewrap(x)
    }
  ];

  const accessibilitySettings = [
    {
      title: 'Plain-text',
      value: textOutput,
      options: [
        {
          value: true, label: 'On', ariaLabel: 'text output on', name: 'text output', id: 'text-output-on'
        },
        {
          value: false, label: 'Off', ariaLabel: 'text output off', name: 'text output', id: 'text-output-off'
        },
      ],
      onSelect: x => setTextOutput(x)
    },
    {
      title: 'Table-text',
      value: gridOutput,
      options: [
        {
          value: true, label: 'On', ariaLabel: 'table output on', name: 'table output', id: 'table-output-on'
        },
        {
          value: false, label: 'Off', ariaLabel: 'table output off', name: 'table output', id: 'table-output-off'
        },
      ],
      onSelect: x => setGridOutput(x)
    },
    {
      title: 'Sound',
      value: soundOutput,
      options: [
        {
          value: true, label: 'On', ariaLabel: 'sound output on', name: 'sound output', id: 'sound-output-on'
        },
        {
          value: false, label: 'Off', ariaLabel: 'sound output off', name: 'sound output', id: 'sound-output-off'
        },
      ],
      onSelect: x => setSoundOutput(x)
    },
  ];

  // useEffect(() => { });

  return (
    <Screen fullscreen>
      <section>

        <SettingsHeader>
          <h1>Settings</h1>

          <div style={{ marginLeft: '2rem' }}>
            <IconLinkWrapper to="/mobile" aria-label="Return to ide view">
              <ExitIcon />
            </IconLinkWrapper>
          </div>
        </SettingsHeader>
        <section className="preferences">
          <Content>
            <SectionHeader>General Settings</SectionHeader>
            { generalSettings.map(option => <Selector key={`${option.title}wrapper`} {...option} />) }

            <SectionHeader>Accessibility</SectionHeader>
            { accessibilitySettings.map(option => <Selector key={`${option.title}wrapper`} {...option} />) }

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
