import { EXTERNAL_LINK_REGEX } from '../../server/utils/fileUtils';

export const hijackConsoleErrorsScript = (offs) => {
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
        if (url.match(${EXTERNAL_LINK_REGEX}) !== null && error.stack){
          var errorNum = error.stack.split('about:srcdoc:')[1].split(':')[0];
          var fileInfo = getScriptOff(errorNum);
          data = msg + ' (' + fileInfo[1] + ': line ' + fileInfo[0] + ')';
        } else {
          var fileInfo = getScriptOff(lineNumber);
          data = msg + ' (' + fileInfo[1] + ': line ' + fileInfo[0] + ')';
        }
        window.parent.postMessage([{
          log: [{
            method: 'error',
            data: [data],
            id: Date.now().toString()
          }],
          source: fileInfo[1]
        }], '*');
      return false;
    };
    // catch rejected promises
    window.onunhandledrejection = function (event) {
      if (event.reason && event.reason.message && event.reason.stack){
        var errorNum = event.reason.stack.split('about:srcdoc:')[1].split(':')[0];
        var fileInfo = getScriptOff(errorNum);
        var data = event.reason.message + ' (' + fileInfo[1] + ': line ' + fileInfo[0] + ')';
        window.parent.postMessage([{
          log: [{
            method: 'error',
            data: [data],
            id: Date.now().toString()
          }],
          source: fileInfo[1]
        }], '*');
      }
    };
  `;
  return s;
};

export const startTag = '@fs-';

export const getAllScriptOffsets = (htmlFile) => {
  const offs = [];
  const hijackConsoleErrorsScriptLength = 52;
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
      lineOffset = htmlFile.substring(0, ind).split('\n').length + hijackConsoleErrorsScriptLength;
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
