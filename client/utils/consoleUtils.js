import {
  EXTERNAL_LINK_REGEX
} from '../../server/utils/fileUtils';

export const hijackConsole = `var iframeWindow = window;
  var originalConsole = iframeWindow.console;
  iframeWindow.console = {};
  
  var methods = [
    'debug', 'clear', 'error', 'info', 'log', 'warn'
  ];
  
  var consoleBuffer = [];
  var LOGWAIT = 500;
  
  methods.forEach( function(method) {
    iframeWindow.console[method] = function() {
      originalConsole[method].apply(originalConsole, arguments);
  
      var args = Array.from(arguments);
      args = args.map(function(i) {
        // catch objects
        return i;
      });
  
      consoleBuffer.push({
        method: method,
        arguments: args,
        source: 'sketch'
      });
    };
  });
  
  setInterval(function() {
    if (consoleBuffer.length > 0) {
      window.parent.postMessage(consoleBuffer, '*');
      consoleBuffer.length = 0;
    }
  }, LOGWAIT);`;

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
          method: 'error',
          arguments: data,
          source: fileInfo[1]
        }], '*');
      return false;
    };
  `;
  return s;
};

export const startTag = '@fs-';

export const getAllScriptOffsets = (htmlFile) => {
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
      // the length of hijackConsoleErrorsScript is 33 lines
      lineOffset = htmlFile.substring(0, ind).split('\n').length + 33;
      offs.push([lineOffset, filename]);
      lastInd = ind + 1;
    }
  }
  return offs;
};

export const getConsoleFeedLightStyle = {
  'BASE_BACKGROUND_COLOR': '',
  'LOG_ERROR_BACKGROUND': 'hsl(0, 100%, 97%)',
  'LOG_ERROR_COLOR': 'red',
  'LOG_WARN_BACKGROUND': 'hsl(50, 100%, 95%)',
  'LOG_WARN_COLOR': 'hsl(39, 100%, 18%)',
  'LOG_COLOR': 'rgb(128, 128, 128)',
  'LOG_WARN_BORDER': 'hsl(50, 100%, 88%)',
  'LOG_ERROR_BORDER': 'hsl(0, 100%, 92%)'
};

export const getConsoleFeedDarkStyle = {
  'BASE_BACKGROUND_COLOR': '',
  'BASE_COLOR': 'white',
  'OBJECT_NAME_COLOR': 'white',
  'OBJECT_VALUE_NULL_COLOR': 'hsl(230, 100%, 80%)',
  'OBJECT_VALUE_UNDEFINED_COLOR': 'hsl(230, 100%, 80%)',
  'OBJECT_VALUE_REGEXP_COLOR': 'hsl(230, 100%, 80%)',
  'OBJECT_VALUE_STRING_COLOR': 'hsl(230, 100%, 80%)',
  'OBJECT_VALUE_SYMBOL_COLOR': 'hsl(230, 100%, 80%)',
  'OBJECT_VALUE_NUMBER_COLOR': 'hsl(230, 100%, 80%)',
  'OBJECT_VALUE_BOOLEAN_COLOR': 'hsl(230, 100%, 80%)',
  'OBJECT_VALUE_FUNCTION_KEYWORD_COLOR': 'hsl(230, 100%, 80%)',
  'LOG_ERROR_BACKGROUND': 'hsl(0, 100%, 8%)',
  'LOG_ERROR_COLOR': 'hsl(0, 100%, 75%)',
  'LOG_WARN_BACKGROUND': 'hsl(50, 100%, 10%)',
  'LOG_WARN_COLOR': 'hsl(39, 100%, 80%)'
};

export const getConsoleFeedContrastStyle = getConsoleFeedDarkStyle;
