import React from 'react';

class TextOutput extends React.Component {
  componentDidMount() {

  }
  render() {
    return (
      <section
        className="textoutput"
        id="canvas-sub"
        tabIndex="0"
        role="main"
        aria-label="text-output"
        title="canvas text output"
      >
        <section id="textOutput-content">
        </section>
        <p
          tabIndex="0"
          role="main"
          id="textOutput-content-summary"
          aria-label="text output summary"
        >
        </p>
        <p
          tabIndex="0"
          role="main"
          id="textOutput-content-details"
          aria-label="text output summary details"
        >
        </p>
        <table
          id="textOutput-content-table"
          summary="text output object details"
          title="output details"
        >
        </table>
      </section>
    );
  }
}

export default TextOutput;
