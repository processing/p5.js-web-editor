import React, { PropTypes } from 'react';

/**
 *  How many console messages to store
 *  @type {Number}
 */
const consoleMax = 5;

class Console extends React.Component {

  constructor(props) {
    super(props);

    /**
     *  An array of React Elements that include previous console messages
     *  @type {Array}
     */
    this.children = [];
  }

  shouldComponentUpdate(nextProps) {
    // clear children if paused, but only update when new consoleEvent happens
    if (!nextProps.isPlaying) {
      this.children = [];
    }
    return nextProps.consoleEvent !== this.props.consoleEvent;
  }

  render() {
    const args = this.props.consoleEvent.arguments;
    const method = this.props.consoleEvent.method;

    const nextChild = (
      <div key={this.children.length} className={method}>
        {Object.keys(args).map((key) => <span key={`${this.children.length}-${key}`}>{args[key]}</span>)}
      </div>
    );
    this.children.push(nextChild);

    if (this.children.length > consoleMax) {
      this.children = this.children.slice(0, 1);
    }

    return (
      <div ref="console" className="preview-console">
        {this.children}
      </div>
    );
  }

}

Console.propTypes = {
  consoleEvent: PropTypes.object,
  isPlaying: PropTypes.bool.isRequired
};

export default Console;
