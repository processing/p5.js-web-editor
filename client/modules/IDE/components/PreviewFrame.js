import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import escapeStringRegexp from 'escape-string-regexp';
import srcDoc from 'srcdoc-polyfill';

function getAllScriptOffsets(htmlFile) {
  var offs = [];
  var found = true;
  var lastInd = 0;
  var startTag = 'filestart-';
  while (found) {
    var ind = htmlFile.indexOf(startTag, lastInd);
    if (ind == -1) {
      found = false;
    } else {
      var endFilenameInd = htmlFile.indexOf('.js', ind+startTag.length);
      var filename = htmlFile.substring(ind+startTag.length, endFilenameInd);
      var lineOffset = htmlFile.substring(0, ind).split('\n').length;
      offs.push([lineOffset, filename+'.js']);
      lastInd = ind + 1;
    }
  }
  return offs;
}

function hijackConsoleScript(offs) {
  return `<script>

    function getScriptOff(line) {
      var offs = `+offs+`;
      var l = 0;
      var file = '';
      for (var i=0; i<offs.length; i++) {
        var n = offs[i][0];
        if (n < line && n > l) {
          l = n;
          file = offs[i][1];
        }
      }
      return [line - l, file];
    }


    document.addEventListener('DOMContentLoaded', function() {
      var iframeWindow = window;
      var originalConsole = iframeWindow.console;
      iframeWindow.console = {};

      var methods = [
        'debug', 'clear', 'error', 'info', 'log', 'warn'
      ];

      methods.forEach( function(method) {
        iframeWindow.console[method] = function() {
          originalConsole[method].apply(originalConsole, arguments);

          var args = Array.from(arguments);
          args = args.map(function(i) {
            // catch objects
            return (typeof i === 'undefined') ? 'undefined' : JSON.stringify(i);
          });

          // post message to parent window
          window.parent.postMessage({
            method: method,
            arguments: args,
            source: 'sketch'
          }, '*');
        };
      });

      // catch reference errors, via http://stackoverflow.com/a/12747364/2994108
      window.onerror = function (msg, url, lineNumber, columnNo, error) {
          var string = msg.toLowerCase();
          var substring = "script error";
          var data = {};

          if (string.indexOf(substring) !== -1){
            data = 'Script Error: See Browser Console for Detail';
          } else {
            var fileInfo = getScriptOff(lineNumber);
            data = msg + ' (' + fileInfo[1] + ': line ' + fileInfo[0] + ')';
          }
          window.parent.postMessage({
            method: 'error',
            arguments: data,
            source: 'sketch'
          }, '*');
        return false;
      };
    });
  </script>`;
}

class PreviewFrame extends React.Component {

  componentDidMount() {
    if (this.props.isPlaying) {
      this.renderFrameContents();
    }

    if (this.props.dispatchConsoleEvent) {
      window.addEventListener('message', (msg) => {
        if (msg.data.source === 'sketch') {
          this.props.dispatchConsoleEvent(msg);
        }
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.isPlaying !== prevProps.isPlaying) {
      this.renderSketch();
    }

    if (this.props.isPlaying && this.props.content !== prevProps.content) {
      this.renderSketch();
    }

    // I apologize for this, it is a hack.
    if (this.props.isPlaying && this.props.files[0].id !== prevProps.files[0].id) {
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
      let jsFileStrings = newJSFile.content.match(/(['"])((\\\1|.)*?)\1/gm);
      jsFileStrings = jsFileStrings || [];
      jsFileStrings.forEach(jsFileString => {
        if (jsFileString.match(/^('|")(?!(http:\/\/|https:\/\/)).*\.(png|jpg|jpeg|gif|bmp|mp3|wav|aiff|ogg|json)('|")$/i)) {
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
      htmlFile = htmlFile.replace(fileRegex, `<script data-tag="filestart-`+jsFile.name+`">\n${jsFile.content}\n</script>`);
    });

    this.props.cssFiles.forEach(cssFile => {
      const fileName = escapeStringRegexp(cssFile.name);
      const fileRegex = new RegExp(`<link.*?href=('|")((\.\/)|\/)?${fileName}('|").*?>`, 'gmi');
      htmlFile = htmlFile.replace(fileRegex, `<style>\n${cssFile.content}\n</style>`);
    });

    if (this.props.textOutput || this.props.isTextOutputPlaying) {
      const htmlHead = htmlFile.match(/(?:<head.*?>)([\s\S]*?)(?:<\/head>)/gmi);
      const headRegex = new RegExp('head', 'i');
      let htmlHeadContents = htmlHead[0].split(headRegex)[1];
      htmlHeadContents = htmlHeadContents.slice(1, htmlHeadContents.length - 2);
      htmlHeadContents += '<script src="/loadData.js"></script>\n';
      htmlHeadContents += '<script src="/interceptor-functions.js"></script>\n';
      htmlHeadContents += '<script src="/intercept-p5.js"></script>\n';
      htmlHeadContents += '<script type="text/javascript" src="/ntc.min.js"></script>';
      htmlFile = htmlFile.replace(/(?:<head.*?>)([\s\S]*?)(?:<\/head>)/gmi, `<head>\n${htmlHeadContents}\n</head>`);
    }

    var scriptOffs = getAllScriptOffsets(htmlFile);
    htmlFile += hijackConsoleScript(JSON.stringify(scriptOffs));

    return htmlFile;
  }

  renderSketch() {
    const doc = ReactDOM.findDOMNode(this);
    if (this.props.isPlaying) {
      srcDoc.set(doc, this.injectLocalFiles());
    } else {
      doc.srcdoc = '';
      srcDoc.set(doc, '  ');
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
        aria-label="sketch output"
        role="main"
        tabIndex="0"
        frameBorder="0"
        title="sketch output"
        sandbox="allow-scripts allow-pointer-lock allow-same-origin allow-popups allow-modals allow-forms"
      />
    );
  }
}

PreviewFrame.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  isTextOutputPlaying: PropTypes.bool.isRequired,
  textOutput: PropTypes.bool.isRequired,
  head: PropTypes.object.isRequired,
  content: PropTypes.string,
  htmlFile: PropTypes.shape({
    content: PropTypes.string.isRequired
  }),
  jsFiles: PropTypes.array.isRequired,
  cssFiles: PropTypes.array.isRequired,
  files: PropTypes.array.isRequired,
  dispatchConsoleEvent: PropTypes.func,
  children: PropTypes.element
};

export default PreviewFrame;
