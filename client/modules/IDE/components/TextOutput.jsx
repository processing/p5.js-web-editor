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
        className="accessible-output"
        id="canvas-sub"
        ref={(element) => { this.canvasTextOutput = element; }}
        tabIndex="0"
        aria-label="accessible-output"
        title="canvas text output"
      >
        <section id="textOutput-content">
          <h2> Text Output </h2>
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
        <section id="gridOutput-content">
          <h2> Grid Output </h2>
          <p
            tabIndex="0"
            role="main"
            id="gridOutput-content-summary"
            aria-label="grid output summary"
          >
          </p>
          <table
            tabIndex="0"
            role="main"
            id="gridOutput-content-table"
            aria-label="grid output details"
          >
          </table>
          <div
            tabIndex="0"
            role="main"
            id="gridOutput-content-details"
            aria-label="grid output details"
          >
          </div>
        </section>

      </section>
    );
  }
}

TextOutput.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  previewIsRefreshing: PropTypes.bool.isRequired
};

export default TextOutput;
