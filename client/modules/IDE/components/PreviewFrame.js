import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import escapeStringRegexp from 'escape-string-regexp';
import srcDoc from 'srcdoc-polyfill';

class PreviewFrame extends React.Component {

  componentDidMount() {
    if (this.props.isPlaying) {
      this.renderFrameContents();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.isPlaying !== prevProps.isPlaying) {
      this.renderSketch();
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

    // have to build the array manually because the spread operator is only
    // one level down...
    const jsFiles = [];
    this.props.jsFiles.forEach(jsFile => {
      const newJSFile = { ...jsFile };
      const jsFileStrings = newJSFile.content.match(/(['"])((\\\1|.)*?)\1/gm);
      jsFileStrings.forEach(jsFileString => {
        if (jsFileString.match(/^('|")(?!(http:\/\/|https:\/\/)).*\.(png|jpg|jpeg|gif|bmp)('|")$/)) {
          const filePath = jsFileString.substr(1, jsFileString.length - 2);
          let fileName = filePath;
          if (fileName.match(/^\.\//)) {
            fileName = fileName.substr(2, fileName.length - 1);
          } else if (fileName.match(/^\//)) {
            fileName = fileName.substr(1, fileName.length - 1);
          }
          this.props.files.forEach(file => {
            if (file.name === fileName) {
              newJSFile.content = newJSFile.content.replace(filePath, file.blobURL); // eslint-disable-line
            }
          });
        }
      });
      jsFiles.push(newJSFile);
    });

    jsFiles.forEach(jsFile => {
      const fileName = escapeStringRegexp(jsFile.name);
      const fileRegex = new RegExp(`<script.*?src=('|")((\.\/)|\/)?${fileName}('|").*?>([\s\S]*?)<\/script>`, 'gmi');
      htmlFile = htmlFile.replace(fileRegex, `<script>\n${jsFile.content}\n</script>`);
    });

    this.props.cssFiles.forEach(cssFile => {
      const fileName = escapeStringRegexp(cssFile.name);
      const fileRegex = new RegExp(`<link.*?href=('|")((\.\/)|\/)?${fileName}('|").*?>`, 'gmi');
      htmlFile = htmlFile.replace(fileRegex, `<style>\n${cssFile.content}\n</style>`);
    });

    return htmlFile;
  }

  renderSketch() {
    const doc = ReactDOM.findDOMNode(this);
    if (this.props.isPlaying) {
      // TODO add polyfill for this
      // doc.srcdoc = this.injectLocalFiles();
      srcDoc.set(doc, this.injectLocalFiles());
    } else {
      // doc.srcdoc = '';
      srcDoc.set(doc, '');
      doc.contentWindow.document.open();
      doc.contentWindow.document.write('');
      doc.contentWindow.document.close();
    }
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
        role="region"
        tabIndex="0"
        frameBorder="0"
        title="sketch output"
        sandbox="allow-scripts allow-pointer-lock allow-same-origin allow-popups allow-modals allow-forms"
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
  jsFiles: PropTypes.array.isRequired,
  cssFiles: PropTypes.array.isRequired,
  files: PropTypes.array.isRequired
};

export default PreviewFrame;
