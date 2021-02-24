import PropTypes from 'prop-types';
import React, { useRef, useEffect, useMemo } from 'react';
import styled from 'styled-components';
// import escapeStringRegexp from 'escape-string-regexp';
import srcDoc from 'srcdoc-polyfill';
import loopProtect from 'loop-protect';
import { JSHINT } from 'jshint';
import decomment from 'decomment';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { getBlobUrl } from '../IDE/actions/files';
import { resolvePathToFile } from '../../../server/utils/filePath';
import {
  MEDIA_FILE_REGEX,
  MEDIA_FILE_QUOTED_REGEX,
  STRING_REGEX,
  PLAINTEXT_FILE_REGEX,
  EXTERNAL_LINK_REGEX,
  NOT_EXTERNAL_LINK_REGEX
} from '../../../server/utils/fileUtils';
import {
  hijackConsoleErrorsScript,
  startTag,
  getAllScriptOffsets
} from '../../utils/consoleUtils';
import { registerFrame } from '../../utils/dispatcher';

import { getHTMLFile } from '../IDE/reducers/files';

import {
  stopSketch,
  expandConsole,
  endSketchRefresh
} from '../IDE/actions/ide';
import {
  setTextOutput,
  setGridOutput,
  setSoundOutput
} from '../IDE/actions/preferences';
import { setBlobUrl } from '../IDE/actions/files';
import { clearConsole, dispatchConsoleEvent } from '../IDE/actions/console';

const shouldRenderSketch = (props, prevProps = undefined) => {
  const { isPlaying, previewIsRefreshing, fullView } = props;

  // if the user explicitly clicks on the play button
  if (isPlaying && previewIsRefreshing) return true;

  if (!prevProps) return false;

  return (
    props.isPlaying !== prevProps.isPlaying || // if sketch starts or stops playing, want to rerender
    props.isAccessibleOutputPlaying !== prevProps.isAccessibleOutputPlaying || // if user switches textoutput preferences
    props.textOutput !== prevProps.textOutput ||
    props.gridOutput !== prevProps.gridOutput ||
    props.soundOutput !== prevProps.soundOutput ||
    (fullView && props.files[0].id !== prevProps.files[0].id)
  );
};

const Frame = styled.iframe`
  min-height: 100%;
  min-width: 100%;
  position: absolute;
  border-width: 0;
  ${({ fullView }) =>
    fullView &&
    `
    position: relative;
  `}
`;

function resolvePathsForElementsWithAttribute(attr, sketchDoc, files) {
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

function resolveCSSLinksInString(content, files) {
  let newContent = content;
  let cssFileStrings = content.match(STRING_REGEX);
  cssFileStrings = cssFileStrings || [];
  cssFileStrings.forEach((cssFileString) => {
    if (cssFileString.match(MEDIA_FILE_QUOTED_REGEX)) {
      const filePath = cssFileString.substr(1, cssFileString.length - 2);
      const quoteCharacter = cssFileString.substr(0, 1);
      const resolvedFile = resolvePathToFile(filePath, files);
      if (resolvedFile) {
        if (resolvedFile.url) {
          newContent = newContent.replace(
            cssFileString,
            quoteCharacter + resolvedFile.url + quoteCharacter
          );
        }
      }
    }
  });
  return newContent;
}

function jsPreprocess(jsText) {
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

function resolveJSLinksInString(content, files) {
  let newContent = content;
  let jsFileStrings = content.match(STRING_REGEX);
  jsFileStrings = jsFileStrings || [];
  jsFileStrings.forEach((jsFileString) => {
    if (jsFileString.match(MEDIA_FILE_QUOTED_REGEX)) {
      const filePath = jsFileString.substr(1, jsFileString.length - 2);
      const quoteCharacter = jsFileString.substr(0, 1);
      const resolvedFile = resolvePathToFile(filePath, files);

      if (resolvedFile) {
        if (resolvedFile.url) {
          newContent = newContent.replace(
            jsFileString,
            quoteCharacter + resolvedFile.url + quoteCharacter
          );
        } else if (resolvedFile.name.match(PLAINTEXT_FILE_REGEX)) {
          // could also pull file from API instead of using bloburl
          // TODO not using redux for the blob url bb
          // const blobURL = getBlobUrl(resolvedFile);
          // this.props.setBlobUrl(resolvedFile, blobURL);
          // newContent = newContent.replace(
          //   jsFileString,
          //   quoteCharacter + blobURL + quoteCharacter
          // );
        }
      }
    }
  });

  return jsPreprocess(newContent);
}

function resolveScripts(sketchDoc, files) {
  const scriptsInHTML = sketchDoc.getElementsByTagName('script');
  const scriptsInHTMLArray = Array.prototype.slice.call(scriptsInHTML);
  scriptsInHTMLArray.forEach((script) => {
    if (
      script.getAttribute('src') &&
      script.getAttribute('src').match(NOT_EXTERNAL_LINK_REGEX) !== null
    ) {
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
    } else if (
      !(
        script.getAttribute('src') &&
        script.getAttribute('src').match(EXTERNAL_LINK_REGEX)
      ) !== null
    ) {
      script.setAttribute('crossorigin', '');
      script.innerHTML = resolveJSLinksInString(script.innerHTML, files); // eslint-disable-line
    }
  });
}

function resolveStyles(sketchDoc, files) {
  const inlineCSSInHTML = sketchDoc.getElementsByTagName('style');
  const inlineCSSInHTMLArray = Array.prototype.slice.call(inlineCSSInHTML);
  inlineCSSInHTMLArray.forEach((style) => {
    style.innerHTML = resolveCSSLinksInString(style.innerHTML, files); // eslint-disable-line
  });

  const cssLinksInHTML = sketchDoc.querySelectorAll('link[rel="stylesheet"]');
  const cssLinksInHTMLArray = Array.prototype.slice.call(cssLinksInHTML);
  cssLinksInHTMLArray.forEach((css) => {
    if (
      css.getAttribute('href') &&
      css.getAttribute('href').match(NOT_EXTERNAL_LINK_REGEX) !== null
    ) {
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

function resolveJSAndCSSLinks(files) {
  const newFiles = [];
  files.forEach((file) => {
    const newFile = { ...file };
    if (file.name.match(/.*\.js$/i)) {
      newFile.content = resolveJSLinksInString(newFile.content, files);
    } else if (file.name.match(/.*\.css$/i)) {
      newFile.content = resolveCSSLinksInString(newFile.content, files);
    }
    newFiles.push(newFile);
  });
  return newFiles;
}

function addLoopProtect(sketchDoc) {
  const scriptsInHTML = sketchDoc.getElementsByTagName('script');
  const scriptsInHTMLArray = Array.prototype.slice.call(scriptsInHTML);
  scriptsInHTMLArray.forEach((script) => {
    script.innerHTML = this.jsPreprocess(script.innerHTML); // eslint-disable-line
  });
}

function injectLocalFiles(files, htmlFile) {
  let scriptOffs = [];
  const resolvedFiles = resolveJSAndCSSLinks(files);
  const parser = new DOMParser();
  const sketchDoc = parser.parseFromString(htmlFile.content, 'text/html');

  const base = sketchDoc.createElement('base');
  base.href = `${window.location.href}/`;
  sketchDoc.head.appendChild(base);

  resolvePathsForElementsWithAttribute('src', sketchDoc, resolvedFiles);
  resolvePathsForElementsWithAttribute('href', sketchDoc, resolvedFiles);
  // should also include background, data, poster, but these are used way less often

  resolveScripts(sketchDoc, resolvedFiles);
  resolveStyles(sketchDoc, resolvedFiles);

  // TODO p5.accessibility
  // const accessiblelib = sketchDoc.createElement('script');
  // accessiblelib.setAttribute(
  //   'src',
  //   'https://cdn.rawgit.com/processing/p5.accessibility/v0.1.1/dist/p5-accessibility.js'
  // );
  // const accessibleOutputs = sketchDoc.createElement('section');
  // accessibleOutputs.setAttribute('id', 'accessible-outputs');
  // accessibleOutputs.setAttribute('aria-label', 'accessible-output');
  // if (this.props.textOutput) {
  //   sketchDoc.body.appendChild(accessibleOutputs);
  //   sketchDoc.body.appendChild(accessiblelib);
  //   const textSection = sketchDoc.createElement('section');
  //   textSection.setAttribute('id', 'textOutput-content');
  //   sketchDoc.getElementById('accessible-outputs').appendChild(textSection);
  // }
  // if (this.props.gridOutput) {
  //   sketchDoc.body.appendChild(accessibleOutputs);
  //   sketchDoc.body.appendChild(accessiblelib);
  //   const gridSection = sketchDoc.createElement('section');
  //   gridSection.setAttribute('id', 'tableOutput-content');
  //   sketchDoc.getElementById('accessible-outputs').appendChild(gridSection);
  // }
  // if (this.props.soundOutput) {
  //   sketchDoc.body.appendChild(accessibleOutputs);
  //   sketchDoc.body.appendChild(accessiblelib);
  //   const soundSection = sketchDoc.createElement('section');
  //   soundSection.setAttribute('id', 'soundOutput-content');
  //   sketchDoc.getElementById('accessible-outputs').appendChild(soundSection);
  // }

  // TODO extra stuff to inject
  // const previewScripts = sketchDoc.createElement('script');
  // previewScripts.src = '/previewScripts.js';
  // sketchDoc.head.appendChild(previewScripts);

  const sketchDocString = `<!DOCTYPE HTML>\n${sketchDoc.documentElement.outerHTML}`;
  scriptOffs = getAllScriptOffsets(sketchDocString);
  const consoleErrorsScript = sketchDoc.createElement('script');
  consoleErrorsScript.innerHTML = hijackConsoleErrorsScript(
    JSON.stringify(scriptOffs)
  );
  addLoopProtect(sketchDoc);
  sketchDoc.head.insertBefore(consoleErrorsScript, sketchDoc.head.firstElement);

  return `<!DOCTYPE HTML>\n${sketchDoc.documentElement.outerHTML}`;
}

function getHtmlFile(files) {
  return files.filter((file) => file.name.match(/.*\.html$/i))[0];
}

function EmbedFrame({ files, isPlaying }) {
  const iframe = useRef();
  const htmlFile = useMemo(() => getHtmlFile(files), [files]);

  useEffect(() => {
    const unsubscribe = registerFrame(iframe.current.contentWindow);
    return () => {
      unsubscribe();
    };
  });

  function renderSketch() {
    const doc = iframe.current;
    if (isPlaying) {
      const htmlDoc = injectLocalFiles(files, htmlFile);
      srcDoc.set(doc, htmlDoc);
    } else {
      doc.srcdoc = '';
      srcDoc.set(doc, '  ');
    }
  }

  useEffect(renderSketch, [files, isPlaying]);
  const sandboxAttributes =
    'allow-scripts allow-pointer-lock allow-popups allow-forms allow-modals allow-downloads';
  return (
    <Frame
      aria-label="Sketch Preview"
      role="main"
      frameBorder="0"
      ref={iframe}
      sandbox={sandboxAttributes}
    />
  );
}

EmbedFrame.propTypes = {
  files: PropTypes.arrayOf({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired
  }).isRequired,
  isPlaying: PropTypes.bool.isRequired
};

export default EmbedFrame;
