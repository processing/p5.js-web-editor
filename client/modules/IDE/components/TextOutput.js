import React, { PropTypes } from 'react';

class TextOutput extends React.Component {
  componentDidMount() {

  }
  render() {
    return (
      <div className="textoutput" id="canvas-sub" tabIndex="0" role="region">
        <section id="textOutput-content">
        </section>
        <div tabIndex="0" role="region" id="textOutput-content-summary">
        </div>
        <div tabIndex="0" role="region" id="textOutput-content-details">
        </div>
        <table id="textOutput-content-table">
        </table>
      </div>
    );
  }
}

// TextOutput.propTypes = {
//   lintMessages: PropTypes.array.isRequired,
//   lineNo: PropTypes.string.isRequired,
// };

export default TextOutput;
