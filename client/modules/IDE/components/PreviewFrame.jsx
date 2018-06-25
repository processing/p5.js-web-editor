import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
// import escapeStringRegexp from 'escape-string-regexp';
import { isEqual } from 'lodash';
import loopProtect from 'loop-protect';
import loopProtectScript from 'loop-protect/dist/loop-protect.min';
import Frame, { FrameContextConsumer } from 'react-frame-component';
import { Hook } from 'console-feed';
import { JSHINT } from 'jshint';
import decomment from 'decomment';
import { getBlobUrl } from '../actions/files';
import { resolvePathToFile } from '../../../../server/utils/filePath';
import {
  MEDIA_FILE_REGEX,
  MEDIA_FILE_QUOTED_REGEX,
  STRING_REGEX,
  PLAINTEXT_FILE_REGEX,
  EXTERNAL_LINK_REGEX,
  NOT_EXTERNAL_LINK_REGEX
} from '../../../../server/utils/fileUtils';
import { startTag }
  from '../../../utils/consoleUtils';

export default class PreviewFrame extends React.Component {
  constructor(props) {
    super(props);
    this.handleConsoleEvent = this.handleConsoleEvent.bind(this);
    this.state = {
      changed: false
    };
  }

  componentDidMount() {
    if (this.props.isPlaying) {
      this.renderFrameContents();
    }

    window.addEventListener('message', this.handleConsoleEvent);
  }

  componentDidUpdate(prevProps) {
    // if sketch starts or stops playing, want to rerender
    if (this.props.isPlaying !== prevProps.isPlaying) {
      // this.renderSketch();
      return;
    }
    // if the user explicitly clicks on the play button
    if (this.props.isPlaying && this.props.previewIsRefreshing) {
      this.state.changed = !this.state.changed;
      if (this.props.endSketchRefresh) {
        this.props.endSketchRefresh();
      }
      // this.renderSketch();
      return;
    }
    // if user switches textoutput preferences
    if (this.props.isAccessibleOutputPlaying !== prevProps.isAccessibleOutputPlaying) {
      this.state.changed = !this.state.changed;
      if (this.props.endSketchRefresh) {
        this.props.endSketchRefresh();
      }
      return;
    }

    if (this.props.textOutput !== prevProps.textOutput) {
      if (this.props.endSketchRefresh) {
        this.props.endSketchRefresh();
      }
      return;
    }

    if (this.props.gridOutput !== prevProps.gridOutput) {
      this.state.changed = !this.state.changed;
      if (this.props.endSketchRefresh) {
        this.props.endSketchRefresh();
      }
      return;
    }

    if (this.props.soundOutput !== prevProps.soundOutput) {
      this.state.changed = !this.state.changed;
      if (this.props.endSketchRefresh) {
        this.props.endSketchRefresh();
      }
      return;
    }

    if (this.props.fullView && this.props.files[0].id !== prevProps.files[0].id) {
      this.state.changed = !this.state.changed;
      if (this.props.endSketchRefresh) {
        this.props.endSketchRefresh();
      }
    }

    // small bug - if autorefresh is on, and the usr changes files
    // in the sketch, preview will reload
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.handleConsoleEvent);
    ReactDOM.unmountComponentAtNode(this.iframeElement.contentDocument.body);
  }

  handleConsoleEvent(messageEvent) {
    if (Array.isArray(messageEvent.data)) {
      messageEvent.data.every((message, index, arr) => {
        const { arguments: args } = message;
        let hasInfiniteLoop = false;
        Object.keys(args).forEach((key) => {
          if (typeof args[key] === 'string' && args[key].includes('Exiting potential infinite loop')) {
            this.props.stopSketch();
            this.props.expandConsole();
            hasInfiniteLoop = true;
          }
        });
        if (hasInfiniteLoop) {
          return false;
        }
        if (index === arr.length - 1) {
          Object.assign(message, { times: 1 });
          return false;
        }
        const cur = Object.assign(message, { times: 1 });
        const nextIndex = index + 1;
        while (isEqual(cur.arguments, arr[nextIndex].arguments) && cur.method === arr[nextIndex].method) {
          cur.times += 1;
          arr.splice(nextIndex, 1);
          if (nextIndex === arr.length) {
            return false;
          }
        }
        return true;
      });

      this.props.dispatchConsoleEvent(messageEvent.data);
    }
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

    const resolvedFiles = this.resolveJSAndCSSLinks(this.props.files);

    const parser = new DOMParser();
    const sketchDoc = parser.parseFromString(htmlFile, 'text/html');

    const base = sketchDoc.createElement('base');
    base.href = `${window.location.href}/`;
    sketchDoc.head.appendChild(base);
    const div = sketchDoc.createElement('div');
    sketchDoc.head.prepend(div);

    this.resolvePathsForElementsWithAttribute('src', sketchDoc, resolvedFiles);
    this.resolvePathsForElementsWithAttribute('href', sketchDoc, resolvedFiles);
    // should also include background, data, poster, but these are used way less often

    this.resolveScripts(sketchDoc, resolvedFiles);
    this.resolveStyles(sketchDoc, resolvedFiles);

    const scriptsToInject = [
      loopProtectScript
      // hijackConsole
    ];
    const accessiblelib = sketchDoc.createElement('script');
    accessiblelib.setAttribute(
      'src',
      'https://cdn.rawgit.com/processing/p5.accessibility/v0.1.1/dist/p5-accessibility.js'
    );
    const accessibleOutputs = sketchDoc.createElement('section');
    accessibleOutputs.setAttribute('id', 'accessible-outputs');
    accessibleOutputs.setAttribute('aria-label', 'accessible-output');
    if (this.props.textOutput) {
      sketchDoc.body.appendChild(accessibleOutputs);
      sketchDoc.body.appendChild(accessiblelib);
      const textSection = sketchDoc.createElement('section');
      textSection.setAttribute('id', 'textOutput-content');
      sketchDoc.getElementById('accessible-outputs').appendChild(textSection);
    }
    if (this.props.gridOutput) {
      sketchDoc.body.appendChild(accessibleOutputs);
      sketchDoc.body.appendChild(accessiblelib);
      const gridSection = sketchDoc.createElement('section');
      gridSection.setAttribute('id', 'gridOutput-content');
      sketchDoc.getElementById('accessible-outputs').appendChild(gridSection);
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
      script.text = scriptToInject;
      sketchDoc.head.appendChild(script);
    });

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
          } else if (resolvedFile.name.match(PLAINTEXT_FILE_REGEX)) {
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
        script.setAttribute('crossorigin', '');
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

  // renderFrameContents() {
  //   const doc = this.iframeElement.contentDocument;
  //   if (doc.readyState === 'complete') {
  //     this.renderSketch();
  //   } else {
  //     setTimeout(this.renderFrameContents, 0);
  //   }
  // }

  render() {
    return (
      <div>
        { this.props.isPlaying &&
        // <iframe
        //   className="preview-frame"
        //   aria-label="sketch output"
        //   role="main"
        //   frameBorder="0"
        //   title="sketch output"
        // ref={(element) => { this.iframeElement = element; }}
        // sandbox="allow-scripts allow-pointer-lock allow-same-origin allow-popups allow-forms allow-modals"
        // />
          <Frame
            className="preview-frame"
            initialContent={this.injectLocalFiles()}
            id="iframe"
            key={this.state.changed}
          >
            <FrameContextConsumer>
              {
                // Callback is invoked with iframe's window and document instances
                ({ document, window }) => {
                  // Render Children
                  const consoleBuffer = [];
                  const LOGWAIT = 500;
                  Hook(window.console, (log) => {
                    const { method, data: args } = log[0];
                    consoleBuffer.push({
                      method,
                      arguments: args,
                      source: 'sketch'
                    });
                  });

                  setInterval(() => {
                    if (consoleBuffer.length > 0) {
                      window.parent.postMessage(consoleBuffer, '*');
                      consoleBuffer.length = 0;
                    }
                  }, LOGWAIT);

                  // catch reference errors, via http://stackoverflow.com/a/12747364/2994108
                  window.onerror = function (msg, url, lineNumber, columnNo, error) {
                    // const string = msg.toLowerCase();
                    // const substring = 'script error';
                    let data = {};
                    data = msg + ' (' + 'sketch' + ': line ' + lineNumber + ')';// eslint-disable-line
                    console.log(data);
                    window.parent.postMessage([{
                      method: 'error',
                      arguments: data,
                      source: lineNumber // eslint-disable-line
                    }], '*');
                    return false;
                  };
                }
              }
            </FrameContextConsumer>
          </Frame>
        }
      </div>
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

// export default PreviewFrame;
