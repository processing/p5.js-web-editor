import PropTypes from 'prop-types';
import React from 'react';
import InlineSVG from 'react-inlinesvg';
import classNames from 'classnames';
import { Console as ConsoleFeed } from 'console-feed';

const upArrowUrl = require('../../../images/up-arrow.svg');
const downArrowUrl = require('../../../images/down-arrow.svg');

class Console extends React.Component {
  componentDidUpdate() {
    this.consoleMessages.scrollTop = this.consoleMessages.scrollHeight;
  }

  getBgColor(theme) {
    switch (theme) {
      case 'light':
        return '#f4f4f4';
      case 'dark':
        return '#363636';
      case 'contrast':
        return '#454545';
      default:
        return '';
    }
  }

  convertArgs(args) {
    try {
      if (!Array.isArray(args)) {
        return Array.of(args);
      }
      return args;
    } catch (error) {
      return args;
    }
  }

  render() {
    const consoleClass = classNames({
      'preview-console': true,
      'preview-console--collapsed': !this.props.isExpanded
    });

    return (
      <div className={consoleClass} role="main" title="console">
        <div className="preview-console__header">
          <h2 className="preview-console__header-title">Console</h2>
          <div className="preview-console__header-buttons">
            <button className="preview-console__clear" onClick={this.props.clearConsole} aria-label="clear console">
              Clear
            </button>
            <button
              className="preview-console__collapse"
              onClick={this.props.collapseConsole}
              aria-label="collapse console"
            >
              <InlineSVG src={downArrowUrl} />
            </button>
            <button className="preview-console__expand" onClick={this.props.expandConsole} aria-label="expand console">
              <InlineSVG src={upArrowUrl} />
            </button>
          </div>
        </div>
        <div ref={(element) => { this.consoleMessages = element; }} className="preview-console__messages">
          {this.props.consoleEvents.map((consoleEvent) => {
            const { arguments: args, method, times } = consoleEvent;
            Object.assign(consoleEvent, { 'data': this.convertArgs(args) });

            if (Object.keys(args).length === 0) {
              return (
                <div key={consoleEvent.id} className="preview-console__undefined">
                  <span key={`${consoleEvent.id}-0`}>undefined</span>
                </div>
              );
            }
            return (
              <div key={consoleEvent.id} className={`preview-console__${method}`}>
                <span>{times > 1 ? times : ''}</span>
                <ConsoleFeed
                  // logs={[
                  //   {
                  //     'method': 'log',
                  //     'data': [[1, 2, 3]]
                  //     'data': ["{ 'id': 1 }"],
                  //     'arguments': ['test'],
                  //     'id': '20',
                  //     'source': 'sketch'
                  //   }
                  // ]}
                  variant="dark"
                  styles={{ 'BASE_BACKGROUND_COLOR': this.getBgColor(this.props.theme) }}
                  logs={Array.of(consoleEvent)}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

Console.propTypes = {
  consoleEvents: PropTypes.arrayOf(PropTypes.shape({
    method: PropTypes.string.isRequired,
    args: PropTypes.arrayOf(PropTypes.string)
  })),
  isExpanded: PropTypes.bool.isRequired,
  collapseConsole: PropTypes.func.isRequired,
  expandConsole: PropTypes.func.isRequired,
  clearConsole: PropTypes.func.isRequired,
  theme: PropTypes.string.isRequired,
};

Console.defaultProps = {
  consoleEvents: []
};

export default Console;
