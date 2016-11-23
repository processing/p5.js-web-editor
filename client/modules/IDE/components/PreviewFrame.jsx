import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
// import escapeStringRegexp from 'escape-string-regexp';
import srcDoc from 'srcdoc-polyfill';

import loopProtect from 'loop-protect';
import { getBlobUrl } from '../actions/files';
import { resolvePathToFile } from '../../../../server/utils/filePath';

const startTag = '@fs-';
const MEDIA_FILE_REGEX = /^('|")(?!(http:\/\/|https:\/\/)).*\.(png|jpg|jpeg|gif|bmp|mp3|wav|aiff|ogg|json|txt|csv|svg|obj|mp4|ogg|webm|mov)('|")$/i;
const MEDIA_FILE_REGEX_NO_QUOTES = /^(?!(http:\/\/|https:\/\/)).*\.(png|jpg|jpeg|gif|bmp|mp3|wav|aiff|ogg|json|txt|csv|svg|obj|mp4|ogg|webm|mov)$/i;
const STRING_REGEX = /(['"])((\\\1|.)*?)\1/gm;
const TEXT_FILE_REGEX = /(.+\.json$|.+\.txt$|.+\.csv$)/i;
const NOT_EXTERNAL_LINK_REGEX = /^(?!(http:\/\/|https:\/\/))/;
const EXTERNAL_LINK_REGEX = /^(http:\/\/|https:\/\/)/;

function getAllScriptOffsets(htmlFile) {
  const offs = [];
  let found = true;
  let lastInd = 0;
  let ind = 0;
  let endFilenameInd = 0;
  let filename = '';
  let lineOffset = 0;
  while (found) {
    ind = htmlFile.indexOf(startTag, lastInd);
    if (ind === -1) {
      found = false;
    } else {
      endFilenameInd = htmlFile.indexOf('.js', ind + startTag.length + 3);
      filename = htmlFile.substring(ind + startTag.length, endFilenameInd);
      lineOffset = htmlFile.substring(0, ind).split('\n').length;
      offs.push([lineOffset, filename]);
      lastInd = ind + 1;
    }
  }
  return offs;
}

function hijackConsoleErrorsScript(offs) {
  const s = `
    function getScriptOff(line) {
      var offs = ${offs};
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

        window.parent.postMessage([{
          method: 'error',
          arguments: data,
          source: 'sketch'
        }], '*');
      return false;
    };
  `;
  return s;
}

class PreviewFrame extends React.Component {

  componentDidMount() {
    if (this.props.isPlaying) {
      this.renderFrameContents();
    }

    if (this.props.dispatchConsoleEvent) {
      window.addEventListener('message', (msg) => {
        this.props.dispatchConsoleEvent(msg);
      });
    }
  }

  componentDidUpdate(prevProps) {
    // if sketch starts or stops playing, want to rerender
    if (this.props.isPlaying !== prevProps.isPlaying) {
      this.renderSketch();
      return;
    }

    // if the user explicitly clicks on the play button
    if (this.props.isPlaying && this.props.previewIsRefreshing) {
      this.renderSketch();
      return;
    }

    // if user switches textoutput preferences
    if (this.props.isTextOutputPlaying !== prevProps.isTextOutputPlaying) {
      this.renderSketch();
      return;
    }

    if (this.props.textOutput !== prevProps.textOutput) {
      this.renderSketch();
      return;
    }

    if (this.props.fullView && this.props.files[0].id !== prevProps.files[0].id) {
      this.renderSketch();
      return;
    }

    // small bug - if autorefresh is on, and the usr changes files
    // in the sketch, preview will reload
  }

  componentWillUnmount() {
    ReactDOM.unmountComponentAtNode(ReactDOM.findDOMNode(this).contentDocument.body);
  }

  clearPreview() {
    const doc = ReactDOM.findDOMNode(this);
    doc.srcDoc = '';
  }

  injectLocalFiles() {
    const htmlFile = this.props.htmlFile.content;
    let scriptOffs = [];

    const resolvedFiles = this.resolveJSAndCSSLinks(this.props.files);

    const parser = new DOMParser();
    const sketchDoc = parser.parseFromString(htmlFile, 'text/html');

    this.resolvePathsForElementsWithAttribute('src', sketchDoc, resolvedFiles);
    this.resolvePathsForElementsWithAttribute('href', sketchDoc, resolvedFiles);
    // should also include background, data, poster, but these are used way less often

    this.resolveScripts(sketchDoc, resolvedFiles);
    this.resolveStyles(sketchDoc, resolvedFiles);

    let scriptsToInject = [
      '/loop-protect.min.js',
      '/hijackConsole.js'
    ];
    if (this.props.isTextOutputPlaying || (this.props.textOutput !== 0 && this.props.isPlaying)) {
      let interceptorScripts = [];
      if (this.props.textOutput === 0) {
        this.props.setTextOutput(1);
      }
      if (this.props.textOutput === 1) {
        interceptorScripts = [
          '/p5-interceptor/loadData.js',
          '/p5-interceptor/intercept-helper-functions.js',
          '/p5-interceptor/textInterceptor/interceptor-functions.js',
          '/p5-interceptor/textInterceptor/intercept-p5.js',
          '/p5-interceptor/ntc.min.js'
        ];
      } else if (this.props.textOutput === 2) {
        interceptorScripts = [
          '/p5-interceptor/loadData.js',
          '/p5-interceptor/intercept-helper-functions.js',
          '/p5-interceptor/gridInterceptor/interceptor-functions.js',
          '/p5-interceptor/gridInterceptor/intercept-p5.js',
          '/p5-interceptor/ntc.min.js'
        ];
      } else if (this.props.textOutput === 3) {
        interceptorScripts = [
          '/p5-interceptor/loadData.js',
          '/p5-interceptor/soundInterceptor/intercept-p5.js'
        ];
      }
      scriptsToInject = scriptsToInject.concat(interceptorScripts);
    }

    scriptsToInject.forEach(scriptToInject => {
      const script = sketchDoc.createElement('script');
      script.src = scriptToInject;
      sketchDoc.head.appendChild(script);
    });

    const sketchDocString = `<!DOCTYPE HTML>\n${sketchDoc.documentElement.outerHTML}`;
    scriptOffs = getAllScriptOffsets(sketchDocString);
    const consoleErrorsScript = sketchDoc.createElement('script');
    consoleErrorsScript.innerHTML = hijackConsoleErrorsScript(JSON.stringify(scriptOffs));
    sketchDoc.head.appendChild(consoleErrorsScript);

    return `<!DOCTYPE HTML>\n${sketchDoc.documentElement.outerHTML}`;
  }

  resolvePathsForElementsWithAttribute(attr, sketchDoc, files) {
    const elements = sketchDoc.querySelectorAll(`[${attr}]`);
    elements.forEach(element => {
      if (element.getAttribute(attr).match(MEDIA_FILE_REGEX_NO_QUOTES)) {
        const resolvedFile = resolvePathToFile(element.getAttribute(attr), files);
        if (resolvedFile) {
          element.setAttribute(attr, resolvedFile.url);
        }
      }
    });
  }

  resolveJSAndCSSLinks(files) {
    const newFiles = [];
    files.forEach(file => {
      const newFile = { ...file };
      if (file.name.match(/.*\.js$/i)) {
        newFile.content = this.resolveJSLinksInString(newFile.content, files);
      } else if (file.name.match(/.*\.css$/i)) {
        newFile.content = this.resolveCSSLinksInString(newFile.content, files);
      }
      newFiles.push(newFile);
    });
    return newFiles;
  }

  resolveJSLinksInString(content, files) {
    let newContent = content;
    let jsFileStrings = content.match(STRING_REGEX);
    jsFileStrings = jsFileStrings || [];
    jsFileStrings.forEach(jsFileString => {
      if (jsFileString.match(MEDIA_FILE_REGEX)) {
        const filePath = jsFileString.substr(1, jsFileString.length - 2);
        const resolvedFile = resolvePathToFile(filePath, files);
        if (resolvedFile) {
          if (resolvedFile.url) {
            newContent = newContent.replace(filePath, resolvedFile.url);
          } else if (resolvedFile.name.match(TEXT_FILE_REGEX)) {
            // could also pull file from API instead of using bloburl
            const blobURL = getBlobUrl(resolvedFile);
            this.props.setBlobUrl(resolvedFile, blobURL);
            newContent = newContent.replace(filePath, blobURL);
          }
        }
      }
    });
    newContent = loopProtect(newContent);
    return newContent;
  }

  resolveCSSLinksInString(content, files) {
    let newContent = content;
    let cssFileStrings = content.match(STRING_REGEX);
    cssFileStrings = cssFileStrings || [];
    cssFileStrings.forEach(cssFileString => {
      if (cssFileString.match(MEDIA_FILE_REGEX)) {
        const filePath = cssFileString.substr(1, cssFileString.length - 2);
        const resolvedFile = resolvePathToFile(filePath, files);
        if (resolvedFile) {
          if (resolvedFile.url) {
            newContent = newContent.replace(filePath, resolvedFile.url);
          }
        }
      }
    });
    return newContent;
  }

  resolveScripts(sketchDoc, files) {
    const scriptsInHTML = sketchDoc.getElementsByTagName('script');
    const scriptsInHTMLArray = Array.prototype.slice.call(scriptsInHTML);
    scriptsInHTMLArray.forEach(script => {
      if (script.getAttribute('src') && script.getAttribute('src').match(NOT_EXTERNAL_LINK_REGEX) !== null) {
        const resolvedFile = resolvePathToFile(script.getAttribute('src'), files);
        if (resolvedFile) {
          if (resolvedFile.url) {
            script.setAttribute('src', resolvedFile.url);
          } else {
            script.removeAttribute('src');
            script.innerHTML = resolvedFile.content; // eslint-disable-line
          }
        }
      } else if (!(script.getAttribute('src') && script.getAttribute('src').match(EXTERNAL_LINK_REGEX)) !== null) {
        script.innerHTML = this.resolveJSLinksInString(script.innerHTML, files); // eslint-disable-line
      }
    });
  }

  resolveStyles(sketchDoc, files) {
    const inlineCSSInHTML = sketchDoc.getElementsByTagName('style');
    const inlineCSSInHTMLArray = Array.prototype.slice.call(inlineCSSInHTML);
    inlineCSSInHTMLArray.forEach(style => {
      style.innerHTML = this.resolveCSSLinksInString(style.innerHTML, files); // eslint-disable-line
    });

    const cssLinksInHTML = sketchDoc.querySelectorAll('link[rel="stylesheet"]');
    cssLinksInHTML.forEach(css => {
      if (css.getAttribute('href') && css.getAttribute('href').match(NOT_EXTERNAL_LINK_REGEX) !== null) {
        const resolvedFile = resolvePathToFile(css.getAttribute('href'), files);
        if (resolvedFile) {
          if (resolvedFile.url) {
            css.href = resolvedFile.url; // eslint-disable-line
          } else {
            const style = sketchDoc.createElement('style');
            style.innerHTML = `\n${resolvedFile.content}`;
            sketchDoc.head.appendChild(style);
            css.parentElement.removeChild(css);
          }
        }
      }
    });
  }

  renderSketch() {
    const doc = ReactDOM.findDOMNode(this);
    if (this.props.isPlaying) {
      srcDoc.set(doc, this.injectLocalFiles());
      if (this.props.endSketchRefresh) {
        this.props.endSketchRefresh();
      }
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
        ref="iframe"
        title="sketch output"
        sandbox="allow-scripts allow-pointer-lock allow-same-origin allow-popups allow-forms"
      />
    );
  }
}

PreviewFrame.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  isTextOutputPlaying: PropTypes.bool.isRequired,
  textOutput: PropTypes.number.isRequired,
  setTextOutput: PropTypes.func.isRequired,
  content: PropTypes.string,
  htmlFile: PropTypes.shape({
    content: PropTypes.string.isRequired
  }),
  files: PropTypes.array.isRequired,
  dispatchConsoleEvent: PropTypes.func,
  children: PropTypes.element,
  autorefresh: PropTypes.bool.isRequired,
  endSketchRefresh: PropTypes.func.isRequired,
  previewIsRefreshing: PropTypes.bool.isRequired,
  fullView: PropTypes.bool,
  setBlobUrl: PropTypes.func.isRequired
};

export default PreviewFrame;
