import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';

class EditorAccessibility extends React.Component {
  componentDidMount() {

  }
  render() {
    const messages = [];
    if (this.props.lintMessages.length > 0) {
      this.props.lintMessages.forEach((lintMessage, i) => {
        messages.push((
          <li key={lintMessage.id}>
            {lintMessage.severity} in line
            {lintMessage.line} :
            {lintMessage.message}
          </li>));
      });
    } else {
      messages.push(<li key={0}>{this.props.t('EditorAccessibility.NoLintMessages')}</li>);
    }
    return (
      <div className="editor-accessibility">
        <ul className="editor-lintmessages" title="lint messages">
          {messages}
        </ul>
        <p> {this.props.t('EditorAccessibility.CurrentLine')}
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
  t: PropTypes.func.isRequired
};

export default withTranslation()(EditorAccessibility);
