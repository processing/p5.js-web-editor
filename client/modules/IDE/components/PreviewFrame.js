import React from 'react';
import ReactDOM from 'react-dom';

class PreviewFrame extends React.Component {

  componentDidMount() {
    if (this.props.isPlaying) {
      this.renderFrameContents();
    }
  }

  clearPreview() {
    const doc = ReactDOM.findDOMNode(this).contentDocument;
    doc.write('');
    doc.close();
  }

  renderFrameContents() {
    const doc = ReactDOM.findDOMNode(this).contentDocument;
    if (doc.readyState === 'complete') {
      renderSketch();
    } else {
      setTimeout(this.renderFrameContents, 0);
    }
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

  componentDidUpdate(prevProps, prevState) {
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

  render() {
    return <iframe
      className="preview-frame"
      frameBorder="0"
      sandbox="allow-scripts allow-pointer-lock allow-same-origin allow-popups allow-modals allow-forms"
      title="sketch output"></iframe>;
  }
}

export default PreviewFrame;
