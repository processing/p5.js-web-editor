import React, { PropTypes } from 'react';
import InlineSVG from 'react-inlinesvg';
import classNames from 'classnames';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as PreferencesActions from '../actions/preferences';

const exitUrl = require('../../../images/exit.svg');
const plusUrl = require('../../../images/plus.svg');
const minusUrl = require('../../../images/minus.svg');

class Preferences extends React.Component {
  handleUpdateFont(event) {
    this.props.setFontSize(parseInt(event.target.value, 10));
  }

  handleUpdateIndentation(event) {
    this.props.setIndentation(parseInt(event.target.value, 10));
  }

  render() {
    const preferencesContainerClass = classNames({
      preferences: true,
      'preferences--selected': this.props.isVisible
    });
    let preferencesTabOptionClass = classNames({
      preference__option: true,
      'preference__option--selected': this.props.isTabIndent
    });
    let preferencesSpaceOptionClass = classNames({
      preference__option: true,
      'preference__option--selected': !this.props.isTabIndent
    });
    return (
      <section className={preferencesContainerClass} tabIndex="0" title="preference-menu">
        <div className="preferences__heading">
          <h2 className="preferences__title">Preferences</h2>
          <button
            className="preferences__exit-button"
            onClick={this.props.closePreferences}
            title="exit"
            aria-label="exit preferences"
          >
            <InlineSVG src={exitUrl} alt="Exit Preferences" />
          </button>
        </div>

        <div className="preference">
          <h4 className="preference__title">Text Size</h4>
          <button
            className="preference__minus-button"
            onClick={() => this.props.setFontSize(this.props.fontSize - 2)}
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
            value={this.props.fontSize}
            onChange={this.handleUpdateFont}
          >
          </input>
          <button
            className="preference__plus-button"
            onClick={() => this.props.setFontSize(this.props.fontSize + 2)}
            aria-label="increase font size"
          >
            <InlineSVG src={plusUrl} alt="Increase Font Size" />
            <h6 className="preference__label">Increase</h6>
          </button>
        </div>

        <div className="preference">
          <h4 className="preference__title">Indentation Amount</h4>
          <button
            className="preference__minus-button"
            onClick={() => this.props.setIndentation(this.props.indentationAmount - 2)}
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
            value={this.props.indentationAmount}
            onChange={this.handleUpdateIndentation}
          >
          </input>
          <button
            className="preference__plus-button"
            onClick={() => this.props.setIndentation(this.props.indentationAmount + 2)}
            aria-label="increase indentation amount"
          >
            <InlineSVG src={plusUrl} alt="IncreaseIndentation Amount" />
            <h6 className="preference__label">Increase</h6>
          </button>
          <div className="preference__vertical-list">
            <button className={preferencesSpaceOptionClass} onClick={this.props.indentWithSpace} aria-label="indentation with space">Spaces</button>
            <button className={preferencesTabOptionClass} onClick={this.props.indentWithTab} aria-label="indentation with tab">Tabs</button>
          </div>
        </div>
      </section>
    );
  }
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
  fontSize: PropTypes.number.isRequired,
  indentationAmount: PropTypes.number.isRequired,
  setIndentation: PropTypes.func.isRequired,
  indentWithSpace: PropTypes.func.isRequired,
  indentWithTab: PropTypes.func.isRequired,
  isTabIndent: PropTypes.bool.isRequired,
  setFontSize: PropTypes.func.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(Preferences);
