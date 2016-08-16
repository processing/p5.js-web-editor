import React from 'react';

class TextOutput extends React.Component {
  componentDidMount() {

  }
  render() {
    return (
      <section
        className="text-output"
        id="canvas-sub"
        tabIndex="0"
        aria-label="text-output"
        title="canvas text output"
      >
        <section id="textOutput-content">
        </section>
        <p
          tabIndex="0"
          role="region"
          id="textOutput-content-summary"
          aria-label="text output summary"
        >
        </p>
        <table
          tabIndex="0"
          role="region"
          id="textOutput-content-details"
          aria-label="text output summary details"
        >
        </table>
      </section>
    );
  }
}

export default TextOutput;
