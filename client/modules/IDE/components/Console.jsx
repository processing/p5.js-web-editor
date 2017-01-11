import React, { PropTypes } from 'react';
import InlineSVG from 'react-inlinesvg';
const upArrowUrl = require('../../../images/up-arrow.svg');
const downArrowUrl = require('../../../images/down-arrow.svg');
import classNames from 'classnames';

class Console extends React.Component {
  componentDidUpdate() {
    this.refs.console_messages.scrollTop = this.refs.console_messages.scrollHeight;
  }

  render() {
    const consoleClass = classNames({
      'preview-console': true,
      'preview-console--collapsed': !this.props.isExpanded
    });

    return (
      <div ref="console" className={consoleClass} role="main" tabIndex="0" title="console">
        <div className="preview-console__header">
          <h2 className="preview-console__header-title">Console</h2>
          <div className="preview-console__header-buttons">
            <a className="preview-console__clear" onClick={this.props.clearConsole} aria-label="clear console">
              Clear
            </a>
            <button className="preview-console__collapse" onClick={this.props.collapseConsole} aria-label="collapse console">
              <InlineSVG src={downArrowUrl} />
            </button>
            <button className="preview-console__expand" onClick={this.props.expandConsole} aria-label="expand console">
              <InlineSVG src={upArrowUrl} />
            </button>
          </div>
        </div>
        <div ref="console_messages" className="preview-console__messages">
          {this.props.consoleEvents.map((consoleEvent, index) => {
            const args = consoleEvent.arguments;
            const method = consoleEvent.method;
            if (Object.keys(args).length === 0) {
              return (
                <div key={index} className="preview-console__undefined">
                  <span key={`${index}-0`}>{'undefined'}</span>
                </div>
              );
            }
            return (
              <div key={index} className={`preview-console__${method}`}>
                {Object.keys(args).map((key) => <span key={`${index}-${key}`}>{args[key]}</span>)}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

}

Console.propTypes = {
  consoleEvents: PropTypes.array,
  isPlaying: PropTypes.bool.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  collapseConsole: PropTypes.func.isRequired,
  expandConsole: PropTypes.func.isRequired,
  clearConsole: PropTypes.func.isRequired
};

export default Console;
