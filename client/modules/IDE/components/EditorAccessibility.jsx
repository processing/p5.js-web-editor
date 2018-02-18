import PropTypes from 'prop-types';
import React from 'react';

class EditorAccessibility extends React.Component {
  componentDidMount() {

  }
  render() {
    const messages = [];
    if (this.props.lintMessages.length > 0) {
      this.props.lintMessages.forEach((lintMessage, i) => {
        messages.push(
          <li key={lintMessage.id}>
            {lintMessage.severity} in line
            {lintMessage.line} :
            {lintMessage.message}
          </li>
        );
      });
    } else {
      messages.push(
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
  lintMessages: PropTypes.arrayOf(PropTypes.shape({
    severity: PropTypes.string.isRequired,
    line: PropTypes.number.isRequired,
    message: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired
  })).isRequired,
};

export default EditorAccessibility;
