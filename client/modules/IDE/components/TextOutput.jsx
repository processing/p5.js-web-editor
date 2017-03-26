import React, { PropTypes } from 'react';

class TextOutput extends React.Component {
  componentDidMount() {
    this.canvasTextOutput.focus();
  }
  componentDidUpdate(prevProps) {
    // if the user explicitly clicks on the play button, want to refocus on the text output
    if (this.props.isPlaying && this.props.previewIsRefreshing) {
      this.canvasTextOutput.focus();
    }
  }
  render() {
    return (
      <section
        className="text-output"
        id="canvas-sub"
        ref={(element) => { this.canvasTextOutput = element; }}
        tabIndex="0"
        aria-label="text-output"
        title="canvas text output"
      >
        <h2> Output </h2>
        <section id="textOutput-content">
        </section>
        <p
          tabIndex="0"
          role="main"
          id="textOutput-content-summary"
          aria-label="text output summary"
        >
        </p>
        <table
          tabIndex="0"
          role="main"
          id="textOutput-content-table"
          aria-label="text output details"
        >
        </table>
        <div
          tabIndex="0"
          role="main"
          id="textOutput-content-details"
          aria-label="text output details"
        >
        </div>
      </section>
    );
  }
}

TextOutput.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  previewIsRefreshing: PropTypes.bool.isRequired
};

export default TextOutput;
