import React, { PropTypes } from 'react';

class EditorAccessibility extends React.Component {
  componentDidMount() {

  }
  render() {
    let messages = [];
    if (this.props.lintMessages.length > 0) {
      this.props.lintMessages.forEach((lintMessage, i) => {
        messages.push(
          <li key={i}>
            {lintMessage.severity} in line
            {lintMessage.line} :
            {lintMessage.message}
          </li>
        );
      });
    } else {
      messages.push(
        // no array index so let's just call it 0
        <li tabIndex="0" key={0}> There are no lint messages </li>
      );
    }
    return (
      <div className="editor-accessibility">
        <ul className="editor-lintmessages" title="lint messages">
          {messages}
        </ul>
        <p> Current line
          <span className="editor-linenumber" aria-live="polite" aria-atomic="true" id="current-line"> </span>
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
