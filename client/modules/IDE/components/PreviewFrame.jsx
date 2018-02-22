import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
// import escapeStringRegexp from 'escape-string-regexp';
import srcDoc from 'srcdoc-polyfill';

import loopProtect from 'loop-protect';
import { JSHINT } from 'jshint';
import { getBlobUrl } from '../actions/files';
import { resolvePathToFile } from '../../../../server/utils/filePath';
import {
  MEDIA_FILE_REGEX,
  MEDIA_FILE_QUOTED_REGEX,
  STRING_REGEX,
  TEXT_FILE_REGEX,
  EXTERNAL_LINK_REGEX,
  NOT_EXTERNAL_LINK_REGEX
} from '../../../../server/utils/fileUtils';

const decomment = require('decomment');

const startTag = '@fs-';

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
      // the length of hijackConsoleErrorsScript is 31 lines
      lineOffset = htmlFile.substring(0, ind).split('\n').length + 31;
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
          source: fileInfo[1]
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

    window.addEventListener('message', (messageEvent) => {
      console.log(messageEvent);
      messageEvent.data.forEach((message) => {
        const args = message.arguments;
        Object.keys(args).forEach((key) => {
          if (args[key].includes('Exiting potential infinite loop')) {
            this.props.stopSketch();
            this.props.expandConsole();
          }
        });
      });
      this.props.dispatchConsoleEvent(messageEvent.data);
    });
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
    if (this.props.isAccessibleOutputPlaying !== prevProps.isAccessibleOutputPlaying) {
      this.renderSketch();
      return;
    }

    if (this.props.textOutput !== prevProps.textOutput) {
      this.renderSketch();
      return;
    }

    if (this.props.gridOutput !== prevProps.gridOutput) {
      this.renderSketch();
      return;
    }

    if (this.props.soundOutput !== prevProps.soundOutput) {
      this.renderSketch();
      return;
    }

    if (this.props.fullView && this.props.files[0].id !== prevProps.files[0].id) {
      this.renderSketch();
    }

    // small bug - if autorefresh is on, and the usr changes files
    // in the sketch, preview will reload
  }

  componentWillUnmount() {
    ReactDOM.unmountComponentAtNode(this.iframeElement.contentDocument.body);
  }

  clearPreview() {
    const doc = this.iframeElement;
    doc.srcDoc = '';
  }

  addLoopProtect(sketchDoc) {
    const scriptsInHTML = sketchDoc.getElementsByTagName('script');
    const scriptsInHTMLArray = Array.prototype.slice.call(scriptsInHTML);
    scriptsInHTMLArray.forEach((script) => {
      script.innerHTML = this.jsPreprocess(script.innerHTML); // eslint-disable-line
    });
  }

  jsPreprocess(jsText) {
    let newContent = jsText;
    // check the code for js errors before sending it to strip comments
    // or loops.
    JSHINT(newContent);

    if (JSHINT.errors.length === 0) {
      newContent = decomment(newContent, {
        ignore: /\/\/\s*noprotect/g,
        space: true
      });
      newContent = loopProtect(newContent);
    }
    return newContent;
  }

  injectLocalFiles() {
    const htmlFile = this.props.htmlFile.content;
    let scriptOffs = [];

    const resolvedFiles = this.resolveJSAndCSSLinks(this.props.files);

    const parser = new DOMParser();
    const sketchDoc = parser.parseFromString(htmlFile, 'text/html');

    const base = sketchDoc.createElement('base');
    base.href = `${window.location.href}/`;
    sketchDoc.head.appendChild(base);

    this.resolvePathsForElementsWithAttribute('src', sketchDoc, resolvedFiles);
    this.resolvePathsForElementsWithAttribute('href', sketchDoc, resolvedFiles);
    // should also include background, data, poster, but these are used way less often

    this.resolveScripts(sketchDoc, resolvedFiles);
    this.resolveStyles(sketchDoc, resolvedFiles);

    const scriptsToInject = [
      '/loop-protect.min.js',
      '/hijackConsole.js'
    ];
    const accessiblelib = sketchDoc.createElement('script');
    accessiblelib.setAttribute('src', 'https://cdn.rawgit.com/MathuraMG/p5-accessibility/9cb5bd0b/dist/p5-accessibility.js');
    const accessibleOutputs = sketchDoc.createElement('section');
    accessibleOutputs.setAttribute('id', 'accessible-outputs');
    accessibleOutputs.style.position = 'absolute';
    accessibleOutputs.style.left = '-1000px';
    accessibleOutputs.style.top = 'auto';
    accessibleOutputs.style.width = '1px';
    accessibleOutputs.style.height = '1px';
    accessibleOutputs.style.overflow = 'hidden';
    if (this.props.textOutput) {
      sketchDoc.body.appendChild(accessibleOutputs);
      sketchDoc.body.appendChild(accessiblelib);
      const textSection = sketchDoc.createElement('section');
      textSection.setAttribute('id', 'textOutput-content');
      sketchDoc.getElementById('accessible-outputs').appendChild(textSection);
      this.iframeElement.focus();
    }
    if (this.props.gridOutput) {
      sketchDoc.body.appendChild(accessibleOutputs);
      sketchDoc.body.appendChild(accessiblelib);
      const gridSection = sketchDoc.createElement('section');
      gridSection.setAttribute('id', 'gridOutput-content');
      sketchDoc.getElementById('accessible-outputs').appendChild(gridSection);
      this.iframeElement.focus();
    }
    if (this.props.soundOutput) {
      sketchDoc.body.appendChild(accessibleOutputs);
      sketchDoc.body.appendChild(accessiblelib);
      const soundSection = sketchDoc.createElement('section');
      soundSection.setAttribute('id', 'soundOutput-content');
      sketchDoc.getElementById('accessible-outputs').appendChild(soundSection);
    }

    scriptsToInject.forEach((scriptToInject) => {
      const script = sketchDoc.createElement('script');
      script.src = scriptToInject;
      sketchDoc.head.appendChild(script);
    });

    const sketchDocString = `<!DOCTYPE HTML>\n${sketchDoc.documentElement.outerHTML}`;
    scriptOffs = getAllScriptOffsets(sketchDocString);
    const consoleErrorsScript = sketchDoc.createElement('script');
    consoleErrorsScript.innerHTML = hijackConsoleErrorsScript(JSON.stringify(scriptOffs));
    this.addLoopProtect(sketchDoc);
    sketchDoc.head.insertBefore(consoleErrorsScript, sketchDoc.head.firstElement);

    return `<!DOCTYPE HTML>\n${sketchDoc.documentElement.outerHTML}`;
  }

  resolvePathsForElementsWithAttribute(attr, sketchDoc, files) {
    const elements = sketchDoc.querySelectorAll(`[${attr}]`);
    const elementsArray = Array.prototype.slice.call(elements);
    elementsArray.forEach((element) => {
      if (element.getAttribute(attr).match(MEDIA_FILE_REGEX)) {
        const resolvedFile = resolvePathToFile(element.getAttribute(attr), files);
        if (resolvedFile && resolvedFile.url) {
          element.setAttribute(attr, resolvedFile.url);
        }
      }
    });
  }

  resolveJSAndCSSLinks(files) {
    const newFiles = [];
    files.forEach((file) => {
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
    jsFileStrings.forEach((jsFileString) => {
      if (jsFileString.match(MEDIA_FILE_QUOTED_REGEX)) {
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

    return this.jsPreprocess(newContent);
  }

  resolveCSSLinksInString(content, files) {
    let newContent = content;
    let cssFileStrings = content.match(STRING_REGEX);
    cssFileStrings = cssFileStrings || [];
    cssFileStrings.forEach((cssFileString) => {
      if (cssFileString.match(MEDIA_FILE_QUOTED_REGEX)) {
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
    scriptsInHTMLArray.forEach((script) => {
      if (script.getAttribute('src') && script.getAttribute('src').match(NOT_EXTERNAL_LINK_REGEX) !== null) {
        const resolvedFile = resolvePathToFile(script.getAttribute('src'), files);
        if (resolvedFile) {
          if (resolvedFile.url) {
            script.setAttribute('src', resolvedFile.url);
          } else {
            script.setAttribute('data-tag', `${startTag}${resolvedFile.name}`);
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
    inlineCSSInHTMLArray.forEach((style) => {
      style.innerHTML = this.resolveCSSLinksInString(style.innerHTML, files); // eslint-disable-line
    });

    const cssLinksInHTML = sketchDoc.querySelectorAll('link[rel="stylesheet"]');
    const cssLinksInHTMLArray = Array.prototype.slice.call(cssLinksInHTML);
    cssLinksInHTMLArray.forEach((css) => {
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
    const doc = this.iframeElement;
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
    const doc = this.iframeElement.contentDocument;
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
        ref={(element) => { this.iframeElement = element; }}
        sandbox="allow-scripts allow-pointer-lock allow-same-origin allow-popups allow-forms allow-modals"
      />
    );
  }
}

PreviewFrame.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  isAccessibleOutputPlaying: PropTypes.bool.isRequired,
  textOutput: PropTypes.bool.isRequired,
  gridOutput: PropTypes.bool.isRequired,
  soundOutput: PropTypes.bool.isRequired,
  htmlFile: PropTypes.shape({
    content: PropTypes.string.isRequired
  }).isRequired,
  files: PropTypes.arrayOf(PropTypes.shape({
    content: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    url: PropTypes.string,
    id: PropTypes.string.isRequired
  })).isRequired,
  dispatchConsoleEvent: PropTypes.func.isRequired,
  endSketchRefresh: PropTypes.func.isRequired,
  previewIsRefreshing: PropTypes.bool.isRequired,
  fullView: PropTypes.bool,
  setBlobUrl: PropTypes.func.isRequired,
  stopSketch: PropTypes.func.isRequired,
  expandConsole: PropTypes.func.isRequired
};

PreviewFrame.defaultProps = {
  fullView: false
};

export default PreviewFrame;
