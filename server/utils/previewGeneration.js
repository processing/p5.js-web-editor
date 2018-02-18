import { resolvePathToFile } from '../utils/filePath';

import {
  MEDIA_FILE_REGEX,
  STRING_REGEX,
  TEXT_FILE_REGEX,
  EXTERNAL_LINK_REGEX,
  NOT_EXTERNAL_LINK_REGEX
} from './fileUtils';

function resolveLinksInString(content, files, projectId) {
  let newContent = content;
  let fileStrings = content.match(STRING_REGEX);
  const fileStringRegex = /^('|")(?!(http:\/\/|https:\/\/)).*('|")$/i;
  fileStrings = fileStrings || [];
  fileStrings.forEach((fileString) => {
    // if string does not begin with http or https
    if (fileString.match(fileStringRegex)) {
      const filePath = fileString.substr(1, fileString.length - 2);
      const resolvedFile = resolvePathToFile(filePath, files);
      if (resolvedFile) {
        if (resolvedFile.url) {
          newContent = newContent.replace(filePath, resolvedFile.url);
        } else if (resolvedFile.name.match(TEXT_FILE_REGEX)) {
          let resolvedFilePath = filePath;
          if (resolvedFilePath.startsWith('.')) {
            resolvedFilePath = resolvedFilePath.substr(1);
          }
          while (resolvedFilePath.startsWith('/')) {
            resolvedFilePath = resolvedFilePath.substr(1);
          }
          newContent = newContent.replace(filePath, `/sketches/${projectId}/assets/${resolvedFilePath}`);
        }
      }
    }
  });
  return newContent;
}

export function injectMediaUrls(filesToInject, allFiles, projectId) {
  filesToInject.forEach((file) => {
    file.content = resolveLinksInString(file.content, allFiles, projectId);
  });
}

export function resolvePathsForElementsWithAttribute(attr, sketchDoc, files) {
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

export function resolveScripts(sketchDoc, files, projectId) {
  const scriptsInHTML = sketchDoc.getElementsByTagName('script');
  const scriptsInHTMLArray = Array.prototype.slice.call(scriptsInHTML);
  scriptsInHTMLArray.forEach((script) => {
    if (script.getAttribute('src') && script.getAttribute('src').match(NOT_EXTERNAL_LINK_REGEX) !== null) {
      const resolvedFile = resolvePathToFile(script.getAttribute('src'), files);
      if (resolvedFile) {
        if (resolvedFile.url) {
          script.setAttribute('src', resolvedFile.url);
        } else {
          script.removeAttribute('src');
          script.innerHTML = resolvedFile.content;
        }
      }
    } else if (!(script.getAttribute('src') && script.getAttribute('src').match(EXTERNAL_LINK_REGEX) !== null)) {
      script.innerHTML = resolveLinksInString(script.innerHTML, files, projectId);
    }
  });
}

export function resolveStyles(sketchDoc, files, projectId) {
  const inlineCSSInHTML = sketchDoc.getElementsByTagName('style');
  const inlineCSSInHTMLArray = Array.prototype.slice.call(inlineCSSInHTML);
  inlineCSSInHTMLArray.forEach((style) => {
    style.innerHTML = resolveLinksInString(style.innerHTML, files, projectId);
  });

  const cssLinksInHTML = sketchDoc.querySelectorAll('link[rel="stylesheet"]');
  const cssLinksInHTMLArray = Array.prototype.slice.call(cssLinksInHTML);
  cssLinksInHTMLArray.forEach((css) => {
    if (css.getAttribute('href') && css.getAttribute('href').match(NOT_EXTERNAL_LINK_REGEX) !== null) {
      const resolvedFile = resolvePathToFile(css.getAttribute('href'), files);
      if (resolvedFile) {
        if (resolvedFile.url) {
          css.setAttribute('href', resolvedFile.url);
        } else {
          const style = sketchDoc.createElement('style');
          style.innerHTML = `\n${resolvedFile.content}`;
          sketchDoc.getElementsByTagName('head')[0].appendChild(style);
          css.parentNode.removeChild(css);
        }
      }
    }
  });
}
