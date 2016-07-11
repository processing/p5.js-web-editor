import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import escapeStringRegexp from 'escape-string-regexp';
import 'srcdoc-polyfill';

// sandbox="allow-scripts allow-pointer-lock allow-same-origin allow-popups allow-modals allow-forms"

class PreviewFrame extends React.Component {

  componentDidMount() {
    if (this.props.isPlaying) {
      this.renderFrameContents();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.isPlaying !== prevProps.isPlaying) {
      this.renderSketch();
      // if (this.props.isPlaying) {
      //   this.renderSketch();
      // } else {
      //   this.clearPreview();
      // }
    }

    if (this.props.isPlaying && this.props.content !== prevProps.content) {
      this.renderSketch();
    }
  }

  componentWillUnmount() {
    ReactDOM.unmountComponentAtNode(ReactDOM.findDOMNode(this).contentDocument.body);
  }

  clearPreview() {
    const doc = ReactDOM.findDOMNode(this);
    doc.srcDoc = '';
  }

  injectLocalFiles() {
    let htmlFile = this.props.htmlFile.content;

    this.props.jsFiles.forEach(jsFile => {
      const fileName = escapeStringRegexp(jsFile.name);
      const fileRegex = new RegExp(`<script.*?src=('|")((\.\/)|\/)?${fileName}('|").*?>([\s\S]*?)<\/script>`, 'gmi');
      htmlFile = htmlFile.replace(fileRegex, `<script>\n${jsFile.content}\n</script>`);
    });

    const htmlHead = htmlFile.match(/(?:<head.*?>)([\s\S]*?)(?:<\/head>)/gmi);
    const headRegex = new RegExp('head', 'i');
    let htmlHeadContents = htmlHead[0].split(headRegex)[1];
    htmlHeadContents = htmlHeadContents.slice(1, htmlHeadContents.length - 2);
    htmlHeadContents += '<link rel="stylesheet" type="text/css" href="/preview-styles.css" />\n';
    htmlFile = htmlFile.replace(/(?:<head.*?>)([\s\S]*?)(?:<\/head>)/gmi, `<head>\n${htmlHeadContents}\n</head>`);

    return htmlFile;
  }

  renderSketch() {
    const doc = ReactDOM.findDOMNode(this);
    if (this.props.isPlaying) {
      // TODO add polyfill for this
      doc.srcdoc = this.injectLocalFiles();
    } else {
      doc.srcdoc = '';
    }

    // this.clearPreview();
    // ReactDOM.render(this.props.head, doc.head);
    // const p5Script = doc.createElement('script');
    // p5Script.setAttribute('src', 'https://cdnjs.cloudflare.com/ajax/libs/
    //   p5.js/0.5.0/p5.min.js');
    // doc.body.appendChild(p5Script);

    // const sketchScript = doc.createElement('script');
    // sketchScript.textContent = this.props.content;
    // doc.body.appendChild(sketchScript);
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
        title="sketch output"
      ></iframe>
    );
  }
}

PreviewFrame.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  head: PropTypes.object.isRequired,
  content: PropTypes.string.isRequired,
  htmlFile: PropTypes.shape({
    content: PropTypes.string.isRequired
  }),
  jsFiles: PropTypes.array.isRequired
};

export default PreviewFrame;
