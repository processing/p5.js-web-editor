import blobUtil from 'blob-util';
import React, { useRef, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { jsPreprocess } from './jsPreprocess';
import { resolvePathToFile } from '../../../server/utils/filePath';
import { getConfig } from '../../utils/getConfig';
import {
  MEDIA_FILE_QUOTED_REGEX,
  STRING_REGEX,
  PLAINTEXT_FILE_REGEX,
  EXTERNAL_LINK_REGEX,
  NOT_EXTERNAL_LINK_REGEX
} from '../../../server/utils/fileUtils';
import { getAllScriptOffsets } from '../../utils/consoleUtils';
import type { ScriptOffset } from '../../utils/consoleUtils';
import { registerFrame } from '../../utils/dispatcher';
import { createBlobUrl } from './filesReducer';
import type { PreviewFile } from './filesReducer';
import resolvePathsForElementsWithAttribute from '../../../server/utils/resolveUtils';

let objectUrls: Record<string, string> = {};
let objectPaths: Record<string, string> = {};

interface FrameProps {
  fullView?: boolean;
}

const Frame = styled.iframe<FrameProps>`
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

function getHtmlFile(files: PreviewFile[]) {
  return files.find((file) => file.name.match(/.*\.html$/i));
}

function resolveCSSLinksInString(content: string, files: PreviewFile[]) {
  let newContent = content;
  const cssFileStrings = content.match(STRING_REGEX) || [];
  cssFileStrings.forEach((cssFileString) => {
    if (cssFileString.match(MEDIA_FILE_QUOTED_REGEX)) {
      const filePath = cssFileString.slice(1, -1);
      const quoteCharacter = cssFileString[0];
      const resolvedFile = resolvePathToFile(filePath, files) as
        | PreviewFile
        | false
        | undefined;
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

function resolveJSLinksInString(content: string, files: PreviewFile[]) {
  const indexFile = getHtmlFile(files);
  const indexSrc = indexFile?.content;
  let newContent = content;
  const jsFileStrings = content.match(STRING_REGEX) || [];
  jsFileStrings.forEach((jsFileString) => {
    if (jsFileString.match(MEDIA_FILE_QUOTED_REGEX)) {
      const filePath = jsFileString.slice(1, -1);
      const quoteCharacter = jsFileString[0];
      const resolvedFile = resolvePathToFile(filePath, files) as
        | PreviewFile
        | false
        | undefined;

      if (resolvedFile) {
        if (resolvedFile.url) {
          newContent = newContent.replace(
            jsFileString,
            quoteCharacter + resolvedFile.url + quoteCharacter
          );
        } else if (resolvedFile.name.match(PLAINTEXT_FILE_REGEX)) {
          newContent = newContent.replace(
            jsFileString,
            quoteCharacter + resolvedFile.blobUrl + quoteCharacter
          );
        }
      }
    }
  });

  return jsPreprocess(newContent, indexSrc);
}

function resolveScripts(sketchDoc: Document, files: PreviewFile[]) {
  const scriptsInHTML = sketchDoc.getElementsByTagName('script');
  const scriptsInHTMLArray = Array.prototype.slice.call(scriptsInHTML);
  scriptsInHTMLArray.forEach((script) => {
    const src = script.getAttribute('src');
    if (src && src.match(NOT_EXTERNAL_LINK_REGEX) !== null) {
      const resolvedFile = resolvePathToFile(src, files) as
        | PreviewFile
        | false
        | undefined;
      if (resolvedFile) {
        if (resolvedFile.url) {
          script.setAttribute('src', resolvedFile.url);
        } else {
          const blobUrl = createBlobUrl(resolvedFile);
          script.setAttribute('src', blobUrl);
          const blobPath = blobUrl.split('/').pop() || '';
          objectUrls[blobUrl] = `${
            ((resolvedFile as unknown) as { filePath: string }).filePath
          }/${resolvedFile.name}`;
          objectPaths[blobPath] = resolvedFile.name;
        }
      }
    } else if (!(src && src.match(EXTERNAL_LINK_REGEX)) !== null) {
      script.setAttribute('crossorigin', '');
      script.innerHTML = resolveJSLinksInString(script.innerHTML, files);
    }
  });
}

function resolveStyles(sketchDoc: Document, files: PreviewFile[]) {
  const inlineCSSInHTML = sketchDoc.getElementsByTagName('style');
  const inlineCSSInHTMLArray = Array.prototype.slice.call(inlineCSSInHTML);
  inlineCSSInHTMLArray.forEach((style) => {
    style.innerHTML = resolveCSSLinksInString(style.innerHTML, files);
  });

  const cssLinksInHTML = sketchDoc.querySelectorAll('link[rel="stylesheet"]');
  const cssLinksInHTMLArray = Array.prototype.slice.call(cssLinksInHTML);
  cssLinksInHTMLArray.forEach((css) => {
    const href = css.getAttribute('href');
    if (href && href.match(NOT_EXTERNAL_LINK_REGEX) !== null) {
      const resolvedFile = resolvePathToFile(href, files) as
        | PreviewFile
        | false
        | undefined;
      if (resolvedFile) {
        if (resolvedFile.url) {
          css.setAttribute('href', resolvedFile.url);
        } else {
          const style = sketchDoc.createElement('style');
          style.innerHTML = `\n${resolvedFile.content || ''}`;
          sketchDoc.head.appendChild(style);
          css.parentElement?.removeChild(css);
        }
      }
    }
  });
}

function resolveJSAndCSSLinks(files: PreviewFile[]) {
  const newFiles: PreviewFile[] = [];
  files.forEach((file) => {
    const newFile = { ...file };
    if (file.name.match(/.*\.js$/i)) {
      newFile.content = resolveJSLinksInString(newFile.content || '', files);
    } else if (file.name.match(/.*\.css$/i)) {
      newFile.content = resolveCSSLinksInString(newFile.content || '', files);
    }
    newFiles.push(newFile);
  });
  return newFiles;
}

function addLoopProtect(sketchDoc: Document, indexSrc: string) {
  const scriptsInHTML = sketchDoc.getElementsByTagName('script');
  const scriptsInHTMLArray = Array.prototype.slice.call(scriptsInHTML);
  scriptsInHTMLArray.forEach((script) => {
    script.innerHTML = jsPreprocess(script.innerHTML, indexSrc);
  });
  });
}

interface InjectLocalFilesOptions {
  basePath: string;
  gridOutput: boolean;
  textOutput: boolean;
}

function injectLocalFiles(
  files: PreviewFile[],
  htmlFile: PreviewFile,
  options: InjectLocalFilesOptions
) {
  const { basePath, gridOutput, textOutput } = options;
  let scriptOffs: ScriptOffset[] = [];
  objectUrls = {};
  objectPaths = {};
  const resolvedFiles = resolveJSAndCSSLinks(files);
  const parser = new DOMParser();
  const sketchDoc = parser.parseFromString(htmlFile.content || '', 'text/html');
  const indexFile = getHtmlFile(files);
  const indexSrc = indexFile?.content || '';

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
  previewScripts.src = `${
    window.location.origin
  }${getConfig('PREVIEW_SCRIPTS_URL', { nullishString: true })}`;
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
  addLoopProtect(sketchDoc, indexSrc);
  sketchDoc.head.prepend(consoleErrorsScript);

  return `<!DOCTYPE HTML>\n${sketchDoc.documentElement.outerHTML}`;
}

function getHtmlFile(files: PreviewFile[]) {
  return files.find((file) => file.name.match(/.*\.html$/i));
}

interface EmbedFrameProps {
  files: PreviewFile[];
  isPlaying: boolean;
  basePath: string;
  gridOutput: boolean;
  textOutput: boolean;
}

function EmbedFrame({
  files,
  isPlaying,
  basePath,
  gridOutput,
  textOutput
}: EmbedFrameProps) {
  const iframe = useRef<HTMLIFrameElement>(null);
  const htmlFile = useMemo(() => getHtmlFile(files), [files]);
  const srcRef = useRef<string | null>(null);

  useEffect(() => {
    if (!iframe.current) {
      return () => {};
    }
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
    if (isPlaying && doc && htmlFile) {
      const htmlDoc = injectLocalFiles(files, htmlFile, {
        basePath,
        gridOutput,
        textOutput
      });
      const generatedHtmlFile: PreviewFile = {
        id: 'generated',
        name: 'index.html',
        content: htmlDoc,
        children: [],
        fileType: 'file'
      };
      const htmlUrl = createBlobUrl(generatedHtmlFile);
      const toRevoke = srcRef.current;
      srcRef.current = htmlUrl;
      setTimeout(() => {
        if (doc) {
          doc.src = htmlUrl;
        }
        if (toRevoke) {
          blobUtil.revokeObjectURL(toRevoke);
        }
      }, 0);
    } else if (doc) {
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

export { EmbedFrame };
