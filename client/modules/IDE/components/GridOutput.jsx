import React from 'react';

class GridOutput extends React.Component {
  componentDidMount() {
    this.GridOutputModal.focus();
  }
  render() {
    return (
      <section
        id="gridOutput-content"
        ref={(element) => { this.GridOutputModal = element; }}
      >
        <h2> Grid Output </h2>
        <p
          tabIndex="0"
          role="main"
          id="gridOutput-content-summary"
          aria-label="grid output summary"
        >
        </p>
        <table
          id="gridOutput-content-table"
          summary="grid output details"
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
    );
  }
}

export default GridOutput;
