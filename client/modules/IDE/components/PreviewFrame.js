import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';

class PreviewFrame extends React.Component {

  componentDidMount() {
    this.hijackConsole();

    if (this.props.isPlaying) {
      this.renderFrameContents();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.isPlaying !== prevProps.isPlaying) {
      if (this.props.isPlaying) {
        this.renderSketch();
      } else {
        this.clearPreview();
      }
    }

    if (this.props.isPlaying && this.props.content !== prevProps.content) {
      this.renderSketch();
    }
  }

  componentWillUnmount() {
    ReactDOM.unmountComponentAtNode(ReactDOM.findDOMNode(this).contentDocument.body);
  }

  clearPreview() {
    const doc = ReactDOM.findDOMNode(this).contentDocument;
    doc.write('');
    doc.close();
  }

  hijackConsole() {
    const iframeWindow = ReactDOM.findDOMNode(this).contentWindow;
    const originalConsole = iframeWindow.console;
    iframeWindow.console = {};

    const methods = [
      'debug', 'clear', 'error', 'info', 'log', 'warn'
    ];

    methods.forEach((method) => {
      iframeWindow.console[method] = (...theArgs) => {
        originalConsole[method].apply(originalConsole, theArgs);

        // TO DO: do something with the arguments
        // window.alert(JSON.stringify(theArgs));
      };
    });
  }

  renderSketch() {
    const doc = ReactDOM.findDOMNode(this).contentDocument;
    this.clearPreview();
    ReactDOM.render(this.props.head, doc.head);
    const p5Script = doc.createElement('script');
    p5Script.setAttribute('src', 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.5.0/p5.min.js');
    doc.body.appendChild(p5Script);

    const sketchScript = doc.createElement('script');
    sketchScript.textContent = this.props.content;
    doc.body.appendChild(sketchScript);
  }

  renderFrameContents() {
    const doc = ReactDOM.findDOMNode(this).contentDocument;
    if (doc.readyState === 'complete') {
      this.renderSketch();
    } else {
      setTimeout(this.renderFrameContents, 0);
    }
  }

  render() {
    return (
      <iframe
        className="preview-frame"
        frameBorder="0"
        sandbox="allow-scripts allow-pointer-lock allow-same-origin allow-popups allow-modals allow-forms"
        title="sketch output"
      ></iframe>
    );
  }
}

PreviewFrame.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  head: PropTypes.object.isRequired,
  content: PropTypes.string.isRequired
};

export default PreviewFrame;
