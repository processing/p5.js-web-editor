import React, { PropTypes } from 'react';

class EditorAccessibility extends React.Component {
  componentDidMount() {

  }
  render() {
    let messages = [];
    for (let i = 0; i < this.props.lintMessages.length; i++) {
      messages.push(
        <li>
          {this.props.lintMessages[i].severity} in line
          {this.props.lintMessages[i].line} :
          {this.props.lintMessages[i].message}
        </li>
      );
    }
    return (
      <div>
        <p className="editor-linenumber" aria-live="assertive" id="editor-linenumber">line - {this.props.lineNo}</p>
        <ul className="editor-lintmessages" id="editor-lintmessages" title="lint messages">
          {messages}
        </ul>
        <button className="editor-lintbutton" onClick={this.props.toggleBeep}>Beep</button>
      </div>
    );
  }
}

EditorAccessibility.propTypes = {
  toggleBeep: PropTypes.func.isRequired,
  lintMessages: PropTypes.array.isRequired,
  lineNo: PropTypes.number.isRequired,
};

export default EditorAccessibility;
