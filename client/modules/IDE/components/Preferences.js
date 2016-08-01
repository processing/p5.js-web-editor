import React, { PropTypes } from 'react';
import InlineSVG from 'react-inlinesvg';
import classNames from 'classnames';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as PreferencesActions from '../actions/preferences';

const exitUrl = require('../../../images/exit.svg');
const plusUrl = require('../../../images/plus.svg');
const minusUrl = require('../../../images/minus.svg');

function Preferences(props) {
  const preferencesContainerClass = classNames({
    preferences: true,
    'preferences--selected': props.isVisible
  });
  let preferencesTabOptionClass = classNames({
    preference__option: true,
    'preference__option--selected': props.isTabIndent
  });
  let preferencesSpaceOptionClass = classNames({
    preference__option: true,
    'preference__option--selected': !props.isTabIndent
  });
  return (
    <section className={preferencesContainerClass} tabIndex="0" title="preference-menu">
      <div className="preferences__heading">
        <h2 className="preferences__title">Preferences</h2>
        <button
          className="preferences__exit-button"
          onClick={props.closePreferences}
          title="exit"
          aria-label="exit preferences"
        >
          <InlineSVG src={exitUrl} alt="Exit Preferences" />
        </button>
      </div>

      <div className="preference">
        <h4 className="preference__title">Text Size</h4>
        <button
          className="preference__plus-button"
          onClick={props.decreaseFont}
          aria-label="decrease font size"
        >
          <InlineSVG src={minusUrl} alt="Decrease Font Size" />
          <h6 className="preference__label">Decrease</h6>
        </button>
        <input
          className="preference__value"
          aria-live="status"
          aria-live="polite"
          role="status"
          value={props.fontSize}
          onChange={props.updateFont}
        >
        </input>
        <button
          className="preference__minus-button"
          onClick={props.increaseFont}
          aria-label="increase font size"
        >
          <InlineSVG src={plusUrl} alt="Increase Font Size" />
          <h6 className="preference__label">Increase</h6>
        </button>
      </div>

      <div className="preference">
        <h4 className="preference__title">Indentation Amount</h4>
        <button
          className="preference__plus-button"
          onClick={props.decreaseIndentation}
          aria-label="decrease indentation amount"
        >
          <InlineSVG src={minusUrl} alt="DecreaseIndentation Amount" />
          <h6 className="preference__label">Decrease</h6>
        </button>
        <input
          className="preference__value"
          aria-live="status"
          aria-live="polite"
          role="status"
          value={props.indentationAmount}
          onChange={props.updateIndentation}
        >
        </input>
        <button
          className="preference__minus-button"
          onClick={props.increaseIndentation}
          aria-label="increase indentation amount"
        >
          <InlineSVG src={plusUrl} alt="IncreaseIndentation Amount" />
          <h6 className="preference__label">Increase</h6>
        </button>
        <div className="preference__vertical-list">
          <button className={preferencesSpaceOptionClass} onClick={props.indentWithSpace} aria-label="indentation with space">Spaces</button>
          <button className={preferencesTabOptionClass} onClick={props.indentWithTab} aria-label="indentation with tab">Tabs</button>
        </div>
      </div>
    </section>
  );
}

function mapStateToProps(state) {
  return {
    ...state.preferences
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(PreferencesActions, dispatch);
}

Preferences.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  closePreferences: PropTypes.func.isRequired,
  decreaseFont: PropTypes.func.isRequired,
  updateFont: PropTypes.func.isRequired,
  fontSize: PropTypes.number.isRequired,
  increaseFont: PropTypes.func.isRequired,
  indentationAmount: PropTypes.number.isRequired,
  decreaseIndentation: PropTypes.func.isRequired,
  increaseIndentation: PropTypes.func.isRequired,
  updateIndentation: PropTypes.func.isRequired,
  indentWithSpace: PropTypes.func.isRequired,
  indentWithTab: PropTypes.func.isRequired,
  isTabIndent: PropTypes.bool.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(Preferences);
