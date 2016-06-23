import React from 'react';

const Isvg = require('react-inlinesvg');
const exitUrl = require('../../../images/exit.svg');
const plusUrl = require('../../../images/plus.svg');
const minusUrl = require('../../../images/minus.svg');
const classNames = require('classnames');

class Preferences extends React.Component {
  render() {
    const preferencesContainerClass = classNames({
      preferences: true,
      'preferences--selected': this.props.isVisible
    });
    return (
      <div className={preferencesContainerClass} tabIndex="0">
        <div className="preferences__heading">
          <h2 className="preferences__title">Preferences</h2>
          <button className="preferences__exit-button" onClick={this.props.closePreferences}>
            <Isvg src={exitUrl} alt="Exit Preferences" />
          </button>
        </div>
        <div className="preference">
          <h3 className="preference__title">Text Size</h3>
          <button className="preference__plus-button" onClick={this.props.decreaseFont}>
            <Isvg src={minusUrl} alt="Decrease Font Size" />
          </button>
          <p className="preference__value">{this.props.fontSize}</p>
          <button className="preference__minus-button" onClick={this.props.increaseFont}>
            <Isvg src={plusUrl} alt="Increase Font Size" />
          </button>
        </div>
      </div>
    );
  }
}

export default Preferences;
