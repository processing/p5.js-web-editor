import React from 'react';

class TextOutput extends React.Component {
  componentDidMount() {
    this.TextOutputModal.focus();
  }
  render() {
    return (
      <section
        id="textOutput-content"
        ref={(element) => { this.TextOutputModal = element; }}
      >
        <h2> Text Output </h2>
        <p
          tabIndex="0"
          role="main"
          id="textOutput-content-summary"
          aria-label="text output summary"
        >
        </p>
        <table
          id="textOutput-content-table"
          summary="text output details"
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

export default TextOutput;
