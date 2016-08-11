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
        <p className="editor-linenumber" aria-live="polite" id="editor-linenumber"> {this.props.lineNo} </p>
        <ul className="editor-lintmessages" id="editor-lintmessages" title="lint messages">
          {messages}
        </ul>
      </div>
    );
  }
}

EditorAccessibility.propTypes = {
  lintMessages: PropTypes.array.isRequired,
  lineNo: PropTypes.string.isRequired,
};

export default EditorAccessibility;
