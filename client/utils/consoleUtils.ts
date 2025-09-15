export const startTag = '@fs-';

export type ScriptOffset = [number, string];

/**
 * Extracts line offsets and filenames for JS scripts embedded in an HTML string.
 * @param htmlFile - Full HTML file content as a string
 * @returns Array of [lineOffset, filename] pairs
 */
export const getAllScriptOffsets = (htmlFile: string): ScriptOffset[] => {
  const offs: ScriptOffset[] = [];
  const hijackConsoleErrorsScriptLength = 2;
  const embeddedJSStart = 'script crossorigin=""';
  let foundJSScript = true;
  let foundEmbeddedJS = true;
  let lastInd = 0;
  let ind = 0;
  let endFilenameInd = 0;
  let filename = '';
  let lineOffset = 0;
  while (foundJSScript) {
    ind = htmlFile.indexOf(startTag, lastInd);
    if (ind === -1) {
      foundJSScript = false;
    } else {
      endFilenameInd = htmlFile.indexOf('.js', ind + startTag.length + 1);
      filename = htmlFile.substring(ind + startTag.length, endFilenameInd);
      lineOffset =
        htmlFile.substring(0, ind).split('\n').length +
        hijackConsoleErrorsScriptLength;
      offs.push([lineOffset, filename]);
      lastInd = ind + 1;
    }
  }
  lastInd = 0;
  while (foundEmbeddedJS) {
    ind = htmlFile.indexOf(embeddedJSStart, lastInd);
    if (ind === -1) {
      foundEmbeddedJS = false;
    } else {
      filename = 'index.html';
      // not sure where the offset of 25 comes from
      lineOffset = htmlFile.substring(0, ind).split('\n').length + 25;
      offs.push([lineOffset, filename]);
      lastInd = ind + 1;
    }
  }
  return offs;
};
