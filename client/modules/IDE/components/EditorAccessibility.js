import React, { PropTypes } from 'react';

class EditorAccessibility extends React.Component {
  componentDidMount() {

  }
  render() {
    let messages = [];
    if (this.props.lintMessages.length > 0) {
      for (let i = 0; i < this.props.lintMessages.length; i++) {
        messages.push(
          <li key={i}>
            {this.props.lintMessages[i].severity} in line
            {this.props.lintMessages[i].line} :
            {this.props.lintMessages[i].message}
          </li>
        );
      }
    } else {
      messages.push(
        // react wants dom items from an array or
        // iterator to have a key property. since this
        // is the only item we're pushing to the array
        // and don't have a counter to include,
        // let's just call it 0.
        <p tabIndex="0" key={0}> There are no lint messages </p>
      );
    }
    return (
      <div className="editor-accessibility">
        <ul className="editor-lintmessages" title="lint messages">
          {messages}
        </ul>
        <p> Current line
          <span className="editor-linenumber" aria-live="polite" aria-atomic="true" id="current-line"> {this.props.lineNumber} </span>
        </p>
      </div>
    );
  }
}

EditorAccessibility.propTypes = {
  lintMessages: PropTypes.array.isRequired,
  lineNumber: PropTypes.string.isRequired,
};

export default EditorAccessibility;
