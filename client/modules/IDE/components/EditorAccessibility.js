import React, { PropTypes } from 'react';

class EditorAccessibility extends React.Component {
  componentDidMount() {

  }
  render() {
    let messages = [];
    if (this.props.lintMessages.length > 0) {
      for (let i = 0; i < this.props.lintMessages.length; i++) {
        messages.push(
          <li>
            {this.props.lintMessages[i].severity} in line
            {this.props.lintMessages[i].line} :
            {this.props.lintMessages[i].message}
          </li>
        );
      }
    } else {
      messages.push(
        <p tabIndex="0"> There are no lint messages </p>
      );
    }
    return (
      <div className="editor-accessibility">
        <ul className="editor-lintmessages" title="lint messages">
          {messages}
        </ul>
        <p> Current line
          <span className="editor-linenumber" aria-live="polite" id="current-line"> {this.props.lineNo} </span>
        </p>
      </div>
    );
  }
}

EditorAccessibility.propTypes = {
  lintMessages: PropTypes.array.isRequired,
  lineNo: PropTypes.string.isRequired,
};

export default EditorAccessibility;
