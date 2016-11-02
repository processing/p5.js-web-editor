import React, { PropTypes } from 'react';
import InlineSVG from 'react-inlinesvg';
const upArrowUrl = require('../../../images/up-arrow.svg');
const downArrowUrl = require('../../../images/down-arrow.svg');
import classNames from 'classnames';

/**
 *  How many console messages to store
 *  @type {Number}
 */
const consoleMax = 200;

class Console extends React.Component {

  constructor(props) {
    super(props);

    /**
     *  An array of React Elements that include previous console messages
     *  @type {Array}
     */
    this.children = [];
    this.appendConsoleEvent = this.appendConsoleEvent.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isPlaying && !this.props.isPlaying) {
      this.children = [];
    } else if (nextProps.consoleEvent !== this.props.consoleEvent && this.props.isPlaying) {
      nextProps.consoleEvent.forEach(consoleEvent => {
        if (consoleEvent.source === 'sketch') {
          const args = consoleEvent.arguments;
          Object.keys(args).forEach((key) => {
            if (args[key].includes('Exiting potential infinite loop')) {
              this.props.stopSketch();
              this.props.expandConsole();
              this.appendConsoleEvent(consoleEvent);
            }
          });
          if (nextProps.isExpanded) {
            this.appendConsoleEvent(consoleEvent);
          }
        }
      });
    }
  }

  shouldComponentUpdate(nextProps) {
    return (nextProps.consoleEvent !== this.props.consoleEvent)
      || (nextProps.isPlaying && !this.props.isPlaying)
      || (this.props.isExpanded !== nextProps.isExpanded);
  }

  componentDidUpdate() {
    this.refs.console_messages.scrollTop = this.refs.console_messages.scrollHeight;
  }

  appendConsoleEvent(consoleEvent) {
    const args = consoleEvent.arguments;
    const method = consoleEvent.method;
    let nextChild;
    if (Object.keys(args).length === 0) {
      nextChild = (
        <div key={this.children.length} className="preview-console__undefined">
          <span key={`${this.children.length}-0`}>{'undefined'}</span>
        </div>
      );
    } else {
      nextChild = (
        <div key={this.children.length} className={`preview-console__${method}`}>
          {Object.keys(args).map((key) => <span key={`${this.children.length}-${key}`}>{args[key]}</span>)}
        </div>
      );
    }
    this.children.push(nextChild);
  }

  render() {
    const childrenToDisplay = this.children.slice(-consoleMax);
    const consoleClass = classNames({
      'preview-console': true,
      'preview-console--collapsed': !this.props.isExpanded
    });

    return (
      <div ref="console" className={consoleClass} role="main" tabIndex="0" title="console">
        <div className="preview-console__header">
          <h2 className="preview-console__header-title">console</h2>
          <button className="preview-console__collapse" onClick={this.props.collapseConsole} aria-label="collapse console">
            <InlineSVG src={downArrowUrl} />
          </button>
          <button className="preview-console__expand" onClick={this.props.expandConsole} aria-label="expand console">
            <InlineSVG src={upArrowUrl} />
          </button>
        </div>
        <div ref="console_messages" className="preview-console__messages">
          {childrenToDisplay}
        </div>
      </div>
    );
  }

}

Console.propTypes = {
  consoleEvent: PropTypes.array,
  isPlaying: PropTypes.bool.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  collapseConsole: PropTypes.func.isRequired,
  expandConsole: PropTypes.func.isRequired,
  stopSketch: PropTypes.func.isRequired,
};

export default Console;
