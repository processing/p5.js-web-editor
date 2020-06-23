import React, { useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Screen from '../../components/mobile/MobileScreen';
import Header from '../../components/mobile/Header';
import { ExitIcon } from '../../common/icons';
import { remSize } from '../../theme';
import * as PreferencesActions from '../IDE/actions/preferences';
import * as IdeActions from '../IDE/actions/ide';

const IconLinkWrapper = styled(Link)`
  width: 3rem;
  margin-right: 1.25rem;
  margin-left: none;
`;

const Content = styled.div`
  z-index: 0;
  margin-top: ${remSize(68)};
`;

/*
 <div className="preference">
   <h4 className="preference__title">Word Wrap</h4>
   <div className="preference__options">
     <input
       type="radio"
       onChange={() => this.props.setLinewrap(true)}
       aria-label="linewrap on"
       name="linewrap"
       id="linewrap-on"
       className="preference__radio-button"
       value="On"
       checked={this.props.linewrap}
     />
     <label htmlFor="linewrap-on" className="preference__option">On</label>
     <input
       type="radio"
       onChange={() => this.props.setLinewrap(false)}
       aria-label="linewrap off"
       name="linewrap"
       id="linewrap-off"
       className="preference__radio-button"
       value="Off"
       checked={!this.props.linewrap}
     />
     <label htmlFor="linewrap-off" className="preference__option">Off</label>
   </div>
 </div>
*/

const Selector = ({
  title, value, onSelect, ariaLabel, name, id, options,
}) => (
  <div className="preference">
    <h4 className="preference__title">{title}</h4>
    {options.map(option => (
      <div className="preference__options">
        <input
          type="radio"

          onChange={() => onSelect(option.value)}
          aria-label={ariaLabel}
          name={name}
          id={id}
          className="preference__radio-button"
          value={option.value}
          checked={value === option.value}
        />
        <label htmlFor={id} className="preference__option">{option.label}</label>
      </div>))}

  </div>
);

Selector.defaultProps = {
  options: []
};

Selector.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.string),
  ariaLabel: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  onSelect: PropTypes.string.isRequired,
};

const SettingsHeader = styled(Header)`
  background: transparent
`;


const MobilePreferences = (props) => {
  const { setTheme } = props;
  const preferences = [
    {
      title: 'Theme',
      value: 'light',
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
      onSelect: setTheme // setTheme
    },

    {
      title: 'Autosave',
      value: true,
      options: [
        {
          value: 'On', label: 'On', ariaLabel: 'autosave on', name: 'autosave', id: 'autosave-on'
        },
        {
          value: 'Off', label: 'Off', ariaLabel: 'autosave off', name: 'autosave', id: 'autosave-off'
        },
      ],
      onSelect: () => {} // setAutosave
    }
  ];

  useEffect(() => { });

  return (
    <Screen>
      <SettingsHeader>
        <div>
          <h1>Settings</h1>
        </div>

        <div style={{ marginLeft: '2rem' }}>

          <IconLinkWrapper to="/mobile" aria-label="Return to original editor">
            <ExitIcon />
          </IconLinkWrapper>
        </div>

      </SettingsHeader>
      <section className="preferences">
        <Content>
          { preferences.map(option => <Selector {...option} />) }
        </Content>
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


  preferences: PropTypes.shape({
    fontSize: PropTypes.number.isRequired,
    autosave: PropTypes.bool.isRequired,
    linewrap: PropTypes.bool.isRequired,
    lineNumbers: PropTypes.bool.isRequired,
    lintWarning: PropTypes.bool.isRequired,
    textOutput: PropTypes.bool.isRequired,
    gridOutput: PropTypes.bool.isRequired,
    soundOutput: PropTypes.bool.isRequired,
    theme: PropTypes.string.isRequired,
    autorefreshIdeActions: PropTypes.bool.isRequired
  }).isRequired,

  ide: PropTypes.shape({
    isPlaying: PropTypes.bool.isRequired,
    isAccessibleOutputPlaying: PropTypes.bool.isRequired,
    consoleEvent: PropTypes.array,
    modalIsVisible: PropTypes.bool.isRequired,
    sidebarIsExpanded: PropTypes.bool.isRequired,
    consoleIsExpanded: PropTypes.bool.isRequired,
    preferencesIsVisible: PropTypes.bool.isRequired,
    projectOptionsVisible: PropTypes.bool.isRequired,
    newFolderModalVisible: PropTypes.bool.isRequired,
    shareModalVisible: PropTypes.bool.isRequired,
    shareModalProjectId: PropTypes.string.isRequired,
    shareModalProjectName: PropTypes.string.isRequired,
    shareModalProjectUsername: PropTypes.string.isRequired,
    editorOptionsVisible: PropTypes.bool.isRequired,
    keyboardShortcutVisible: PropTypes.bool.isRequired,
    unsavedChanges: PropTypes.bool.isRequired,
    infiniteLoop: PropTypes.bool.isRequired,
    previewIsRefreshing: PropTypes.bool.isRequired,
    infiniteLoopMessage: PropTypes.string.isRequired,
    projectSavedTime: PropTypes.string,
    previousPath: PropTypes.string.isRequired,
    justOpenedProject: PropTypes.bool.isRequired,
    errorType: PropTypes.string,
    runtimeErrorWarningVisible: PropTypes.bool.isRequired,
    uploadFileModalVisible: PropTypes.bool.isRequired
  }).isRequired,
};

const mapStateToProps = state => ({
  preferences: state.preferences,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  ...PreferencesActions,
  ...IdeActions
}, dispatch);


export default connect(mapStateToProps, mapDispatchToProps)(MobilePreferences);
