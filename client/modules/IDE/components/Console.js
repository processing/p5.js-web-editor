import React, { PropTypes } from 'react';

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
    return (nextProps.consoleEvent !== this.props.consoleEvent) || (nextProps.isPlaying && !this.props.isPlaying);
  }

  componentDidUpdate() {
    this.refs.console_messages.scrollTop = this.refs.console_messages.scrollHeight;
  }

  render() {
    const childrenToDisplay = this.children.slice(-consoleMax);

    return (
      <div ref="console" className="preview-console">
        <h2 className="preview-console__header">console</h2>
        <div ref="console_messages" className="preview-console__messages">
          {childrenToDisplay}
        </div>
      </div>
    );
  }

}

Console.propTypes = {
  consoleEvent: PropTypes.object,
  isPlaying: PropTypes.bool.isRequired
};

export default Console;
