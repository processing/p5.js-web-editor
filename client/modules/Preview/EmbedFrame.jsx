import blobUtil from 'blob-util';
import PropTypes from 'prop-types';
import React, { useRef, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import loopProtect from 'loop-protect';
import { JSHINT } from 'jshint';
import decomment from 'decomment';
import { resolvePathToFile } from '../../../server/utils/filePath';
import getConfig from '../../utils/getConfig';
import {
  MEDIA_FILE_REGEX,
  MEDIA_FILE_QUOTED_REGEX,
  STRING_REGEX,
  PLAINTEXT_FILE_REGEX,
  EXTERNAL_LINK_REGEX,
  NOT_EXTERNAL_LINK_REGEX
} from '../../../server/utils/fileUtils';
import { getAllScriptOffsets } from '../../utils/consoleUtils';
import { registerFrame } from '../../utils/dispatcher';
import { createBlobUrl } from './filesReducer';

let objectUrls = {};
let objectPaths = {};

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

function jsPreprocess(jsText, isModule = false) {
  let newContent = jsText;
  // If this is a module, we need to be careful with transformations
  // as they might break import/export statements
  if (isModule || /\b(import|export)\b/.test(jsText)) {
    // For modules, we still want to check for errors but we'll be more careful with transformations
    JSHINT(newContent, { esversion: 11, module: true });
    // For modules, we only decomment but don't apply loop protection
    // as it might break module semantics
    newContent = decomment(newContent, {
      ignore: /\/\/\s*noprotect/g,
      space: true
    });
    return newContent;
  }
  // For regular scripts, apply the standard processing
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
  // Check if this is an ES module (contains import/export statements)
  const isModule = /\b(import|export)\b/.test(content);
  // Handle regular string references to files
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
        }
      }
    }
  });
  // If this is a module, also handle import statements
  if (isModule) {
    // Match import statements like: import { x } from './file.js';
    // or import x from './file.js';
    const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?(['"])([^'"]+)(['"])/g;
    let importMatch;
    // eslint-disable-next-line no-cond-assign
    while ((importMatch = importRegex.exec(content))) {
      const [fullMatch, openQuote, importPath, closeQuote] = importMatch;
      // Only process relative imports, not package imports
      if (importPath.startsWith('./') || importPath.startsWith('../')) {
        const resolvedFile = resolvePathToFile(importPath, files);
        if (resolvedFile) {
          if (resolvedFile.url) {
            // Replace the import path with the resolved URL
            newContent = newContent.replace(
              fullMatch,
              fullMatch.replace(
                `${openQuote}${importPath}${closeQuote}`,
                `${openQuote}${resolvedFile.url}${closeQuote}`
              )
            );
          } else {
            // Create a blob URL for the imported file
            const blobUrl = createBlobUrl(resolvedFile);
            const blobPath = blobUrl.split('/').pop();
            objectUrls[
              blobUrl
            ] = `${resolvedFile.filePath}/${resolvedFile.name}`;
            objectPaths[blobPath] = resolvedFile.name;
            // Replace the import path with the blob URL
            newContent = newContent.replace(
              fullMatch,
              fullMatch.replace(
                `${openQuote}${importPath}${closeQuote}`,
                `${openQuote}${blobUrl}${closeQuote}`
              )
            );
          }
        }
      }
    }
  }
  // Apply preprocessing with module awareness
  return jsPreprocess(newContent, isModule);
}

function resolveScripts(sketchDoc, files) {
  const scriptsInHTML = sketchDoc.getElementsByTagName('script');
  const scriptsInHTMLArray = Array.prototype.slice.call(scriptsInHTML);
  scriptsInHTMLArray.forEach((script) => {
    // Check if this is a module script
    const isModule = script.getAttribute('type') === 'module';
    if (
      script.getAttribute('src') &&
      script.getAttribute('src').match(NOT_EXTERNAL_LINK_REGEX) !== null
    ) {
      const resolvedFile = resolvePathToFile(script.getAttribute('src'), files);
      if (resolvedFile) {
        if (resolvedFile.url) {
          script.setAttribute('src', resolvedFile.url);
        } else {
          // in the future, when using y.js, could remake the blob for only the file(s)
          // that changed
          const blobUrl = createBlobUrl(resolvedFile);
          script.setAttribute('src', blobUrl);
          const blobPath = blobUrl.split('/').pop();
          // objectUrls[blobUrl] = `${resolvedFile.filePath}${
          //   resolvedFile.filePath.length > 0 ? '/' : ''
          // }${resolvedFile.name}`;
          objectUrls[blobUrl] = `${resolvedFile.filePath}/${resolvedFile.name}`;
          objectPaths[blobPath] = resolvedFile.name;
          // Preserve the module type if it was set
          if (isModule) {
            script.setAttribute('type', 'module');
          }
        }
      }
    } else if (
      !(
        script.getAttribute('src') &&
        script.getAttribute('src').match(EXTERNAL_LINK_REGEX)
      ) !== null
    ) {
      script.setAttribute('crossorigin', '');
      // For inline scripts, we need to handle module content differently
      // to preserve ES module semantics
      if (isModule) {
        // For module scripts, we don't apply loop protection as it might break imports
        script.innerHTML = resolveJSLinksInString(script.innerHTML, files); // eslint-disable-line
      } else {
        script.innerHTML = resolveJSLinksInString(script.innerHTML, files); // eslint-disable-line
      }
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
    script.innerHTML = jsPreprocess(script.innerHTML); // eslint-disable-line
  });
}

function injectLocalFiles(files, htmlFile, options) {
  const { basePath, gridOutput, textOutput } = options;
  let scriptOffs = [];
  objectUrls = {};
  objectPaths = {};
  const resolvedFiles = resolveJSAndCSSLinks(files);
  const parser = new DOMParser();
  const sketchDoc = parser.parseFromString(htmlFile.content, 'text/html');

  const base = sketchDoc.createElement('base');
  base.href = `${window.origin}${basePath}${basePath.length > 1 && '/'}`;
  sketchDoc.head.appendChild(base);

  resolvePathsForElementsWithAttribute('src', sketchDoc, resolvedFiles);
  resolvePathsForElementsWithAttribute('href', sketchDoc, resolvedFiles);
  // should also include background, data, poster, but these are used way less often

  resolveScripts(sketchDoc, resolvedFiles);
  resolveStyles(sketchDoc, resolvedFiles);

  if (textOutput || gridOutput) {
    const scriptElement = sketchDoc.createElement('script');
    let textCode = '';
    if (textOutput) {
      textCode = 'if (!this._accessibleOutputs.text) this.textOutput();';
    }
    let gridCode = '';
    if (gridOutput) {
      gridCode = 'if (!this._accessibleOutputs.grid) this.gridOutput();';
    }
    const fxn = `p5.prototype.ensureAccessibleCanvas = function _ensureAccessibleCanvas() {
  ${textCode}
  ${gridCode}
};
p5.prototype.registerMethod('afterSetup', p5.prototype.ensureAccessibleCanvas);`;
    scriptElement.innerHTML = fxn;
    sketchDoc.head.appendChild(scriptElement);
  }

  const previewScripts = sketchDoc.createElement('script');
  previewScripts.src = `${window.location.origin}${getConfig(
    'PREVIEW_SCRIPTS_URL'
  )}`;
  previewScripts.setAttribute('crossorigin', '');
  sketchDoc.head.appendChild(previewScripts);

  const sketchDocString = `<!DOCTYPE HTML>\n${sketchDoc.documentElement.outerHTML}`;
  scriptOffs = getAllScriptOffsets(sketchDocString);
  const consoleErrorsScript = sketchDoc.createElement('script');
  consoleErrorsScript.innerHTML = `
    window.offs = ${JSON.stringify(scriptOffs)};
    window.objectUrls = ${JSON.stringify(objectUrls)};
    window.objectPaths = ${JSON.stringify(objectPaths)};
    window.editorOrigin = '${getConfig('EDITOR_URL')}';
  `;
  addLoopProtect(sketchDoc);
  sketchDoc.head.prepend(consoleErrorsScript);

  return `<!DOCTYPE HTML>\n${sketchDoc.documentElement.outerHTML}`;
}

function getHtmlFile(files) {
  return files.filter((file) => file.name.match(/.*\.html$/i))[0];
}

function EmbedFrame({ files, isPlaying, basePath, gridOutput, textOutput }) {
  const iframe = useRef();
  const htmlFile = useMemo(() => getHtmlFile(files), [files]);
  const srcRef = useRef();

  useEffect(() => {
    const unsubscribe = registerFrame(
      iframe.current.contentWindow,
      window.origin
    );
    return () => {
      unsubscribe();
    };
  });

  function renderSketch() {
    const doc = iframe.current;
    if (isPlaying) {
      const htmlDoc = injectLocalFiles(files, htmlFile, {
        basePath,
        gridOutput,
        textOutput
      });
      const generatedHtmlFile = {
        name: 'index.html',
        content: htmlDoc
      };
      const htmlUrl = createBlobUrl(generatedHtmlFile);
      const toRevoke = srcRef.current;
      srcRef.current = htmlUrl;
      // BRO FOR SOME REASON YOU HAVE TO DO THIS TO GET IT TO WORK ON SAFARI
      setTimeout(() => {
        doc.src = htmlUrl;
        if (toRevoke) {
          blobUtil.revokeObjectURL(toRevoke);
        }
      }, 0);
    } else {
      doc.src = '';
    }
  }

  useEffect(renderSketch, [files, isPlaying]);
  return (
    <Frame
      aria-label="Sketch Preview"
      role="main"
      frameBorder="0"
      ref={iframe}
    />
  );
}

EmbedFrame.propTypes = {
  files: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired
    })
  ).isRequired,
  isPlaying: PropTypes.bool.isRequired,
  basePath: PropTypes.string.isRequired,
  gridOutput: PropTypes.bool.isRequired,
  textOutput: PropTypes.bool.isRequired
};

export default EmbedFrame;
