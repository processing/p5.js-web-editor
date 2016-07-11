import React, { PropTypes } from 'react';

const Isvg = require('react-inlinesvg');
const exitUrl = require('../../../images/exit.svg');
const plusUrl = require('../../../images/plus.svg');
const minusUrl = require('../../../images/minus.svg');
const classNames = require('classnames');

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
    <div className={preferencesContainerClass} tabIndex="0">
      <div className="preferences__heading">
        <h2 className="preferences__title">Preferences</h2>
        <button className="preferences__exit-button" onClick={props.closePreferences}>
          <Isvg src={exitUrl} alt="Exit Preferences" />
        </button>
      </div>

      <div className="preference">
        <h4 className="preference__title">Text Size</h4>
        <button className="preference__plus-button" onClick={props.decreaseFont}>
          <Isvg src={minusUrl} alt="Decrease Font Size" />
          <h6 className="preference__label">Decrease</h6>
        </button>

        <input className="preference__value" value={props.fontSize} onChange={props.updateFont}></input>
        <button className="preference__minus-button" onClick={props.increaseFont}>
          <Isvg src={plusUrl} alt="Increase Font Size" />
          <h6 className="preference__label">Increase</h6>
        </button>
      </div>

      <div className="preference">
        <h4 className="preference__title">Indentation Amount</h4>
        <button className="preference__plus-button" onClick={props.decreaseIndentation}>
          <Isvg src={minusUrl} alt="DecreaseIndentation Amount" />
          <h6 className="preference__label">Decrease</h6>
        </button>
        <input className="preference__value" value={props.indentationAmount} onChange={props.updateIndentation}></input>
        <button className="preference__minus-button" onClick={props.increaseIndentation}>
          <Isvg src={plusUrl} alt="IncreaseIndentation Amount" />
          <h6 className="preference__label">Increase</h6>
        </button>
        <div className="preference__vertical-list">
          <button className={preferencesSpaceOptionClass} onClick={props.indentWithSpace}>Spaces</button>
          <button className={preferencesTabOptionClass} onClick={props.indentWithTab}>Tabs</button>
        </div>
      </div>
    </div>
  );
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

export default Preferences;
