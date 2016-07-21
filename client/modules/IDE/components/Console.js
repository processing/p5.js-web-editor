import React, { PropTypes } from 'react';
import InlineSVG from 'react-inlinesvg';
const upArrowUrl = require('../../../images/up-arrow.svg');
const downArrowUrl = require('../../../images/down-arrow.svg');
import classNames from 'classnames';

/**
 *  How many console messages to store
 *  @type {Number}
 */
const consoleMax = 100;

class Console extends React.Component {

  constructor(props) {
    super(props);

    /**
     *  An array of React Elements that include previous console messages
     *  @type {Array}
     */
    this.children = [];
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isPlaying && !this.props.isPlaying) {
      this.children = [];
    } else if (nextProps.consoleEvent !== this.props.consoleEvent) {
      const args = nextProps.consoleEvent.arguments;
      const method = nextProps.consoleEvent.method;
      const nextChild = (
        <div key={this.children.length} className={`preview-console__${method}`}>
          {Object.keys(args).map((key) => <span key={`${this.children.length}-${key}`}>{args[key]}</span>)}
        </div>
      );
      this.children.push(nextChild);
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

  render() {
    const childrenToDisplay = this.children.slice(-consoleMax);
    const consoleClass = classNames({
      'preview-console': true,
      'preview-console--collapsed': !this.props.isExpanded
    });

    return (
      <div ref="console" className={consoleClass}>
        <div className="preview-console__header">
          <h2 className="preview-console__header-title">console</h2>
          <a className="preview-console__collapse" onClick={this.props.collapseConsole} >
            <InlineSVG src={downArrowUrl} />
          </a>
          <a className="preview-console__expand" onClick={this.props.expandConsole} >
            <InlineSVG src={upArrowUrl} />
          </a>
        </div>
        <div ref="console_messages" className="preview-console__messages">
          {childrenToDisplay}
        </div>
      </div>
    );
  }

}

Console.propTypes = {
  consoleEvent: PropTypes.object,
  isPlaying: PropTypes.bool.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  collapseConsole: PropTypes.func.isRequired,
  expandConsole: PropTypes.func.isRequired
};

export default Console;
