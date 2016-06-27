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
  return (
    <div className={preferencesContainerClass} tabIndex="0">
      <div className="preferences__heading">
        <h2 className="preferences__title">Preferences</h2>
        <button className="preferences__exit-button" onClick={props.closePreferences}>
          <Isvg src={exitUrl} alt="Exit Preferences" />
        </button>
      </div>
      <div className="preference">
        <h3 className="preference__title">Text Size</h3>
        <button className="preference__plus-button" onClick={props.decreaseFont}>
          <Isvg src={minusUrl} alt="Decrease Font Size" />
        </button>
        <p className="preference__value">{props.fontSize}</p>
        <button className="preference__minus-button" onClick={props.increaseFont}>
          <Isvg src={plusUrl} alt="Increase Font Size" />
        </button>
      </div>
    </div>
  );
}

Preferences.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  closePreferences: PropTypes.func.isRequired,
  decreaseFont: PropTypes.func.isRequired,
  fontSize: PropTypes.number.isRequired,
  increaseFont: PropTypes.func.isRequired
};

export default Preferences;
