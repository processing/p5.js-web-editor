import PropTypes from 'prop-types';
import React from 'react';
import GridOutput from '../components/GridOutput';
import TextOutput from '../components/TextOutput';

class AccessibleOutput extends React.Component {
  componentDidMount() {
    this.accessibleOutputModal.focus();
  }
  componentDidUpdate(prevProps) {
    // if the user explicitly clicks on the play button, want to refocus on the text output
    if (this.props.isPlaying && this.props.previewIsRefreshing) {
      this.accessibleOutputModal.focus();
    }
  }
  render() {
    return (
      <section
        className="accessible-output"
        id="canvas-sub"
        ref={(element) => { this.accessibleOutputModal = element; }}
        tabIndex="0"
        aria-label="accessible-output"
        title="canvas text output"
      >
        {(() => { // eslint-disable-line
          if (this.props.textOutput) {
            return (
              <TextOutput />
            );
          }
        })()}
        {(() => { // eslint-disable-line
          if (this.props.gridOutput) {
            return (
              <GridOutput />
            );
          }
        })()}
      </section>
    );
  }
}

AccessibleOutput.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  previewIsRefreshing: PropTypes.bool.isRequired,
  textOutput: PropTypes.bool.isRequired,
  gridOutput: PropTypes.bool.isRequired
};

export default AccessibleOutput;
