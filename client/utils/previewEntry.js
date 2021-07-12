import loopProtect from 'loop-protect';
import { Hook, Decode, Encode } from 'console-feed';
import StackTrace from 'stacktrace-js';
import evaluateExpression from './evaluateExpression';

// should postMessage user the dispatcher? does the parent window need to
// be registered as a frame? or a just a listener?

// could maybe send these as a message idk
// const { editor } = window;
const editor = window.parent.parent;
const { editorOrigin } = window;
const htmlOffset = 12;
window.objectUrls[window.location.href] = '/index.html';
const blobPath = window.location.href.split('/').pop();
window.objectPaths[blobPath] = 'index.html';

window.loopProtect = loopProtect;

const consoleBuffer = [];
const LOGWAIT = 500;
Hook(window.console, (log) => {
  consoleBuffer.push({
    log
  });
});
setInterval(() => {
  if (consoleBuffer.length > 0) {
    const message = {
      messages: consoleBuffer,
      source: 'sketch'
    };
    editor.postMessage(message, editorOrigin);
    consoleBuffer.length = 0;
  }
}, LOGWAIT);

function handleMessageEvent(e) {
  // maybe don't need this?? idk!
  if (window.origin !== e.origin) return;
  const { data } = e;
  const { source, messages } = data;
  if (source === 'console' && Array.isArray(messages)) {
    const decodedMessages = messages.map((message) => Decode(message.log));
    decodedMessages.forEach((message) => {
      const { data: args } = message;
      const { result, error } = evaluateExpression(args);
      const resultMessages = [
        { log: Encode({ method: error ? 'error' : 'result', data: [result] }) }
      ];
      editor.postMessage(
        {
          messages: resultMessages,
          source: 'sketch'
        },
        editorOrigin
      );
    });
  }
}

window.addEventListener('message', handleMessageEvent);

// catch reference errors, via http://stackoverflow.com/a/12747364/2994108
window.onerror = async function onError(
  msg,
  source,
  lineNumber,
  columnNo,
  error
) {
  // maybe i can use error.stack sometime but i'm having a hard time triggering
  // this function
  let data;
  if (!error) {
    data = msg;
  } else {
    data = `${error.name}: ${error.message}`;
    const resolvedFileName = window.objectUrls[source];
    let resolvedLineNo = lineNumber;
    if (window.objectUrls[source] === 'index.html') {
      resolvedLineNo = lineNumber - htmlOffset;
    }
    const line = `\n    at ${resolvedFileName}:${resolvedLineNo}:${columnNo}`;
    data = data.concat(line);
  }
  editor.postMessage(
    {
      source: 'sketch',
      messages: [
        {
          log: [
            {
              method: 'error',
              data: [data],
              id: Date.now().toString()
            }
          ]
        }
      ]
    },
    editorOrigin
  );
  return false;
};
// catch rejected promises
window.onunhandledrejection = async function onUnhandledRejection(event) {
  if (event.reason && event.reason.message) {
    let stackLines = [];
    if (event.reason.stack) {
      stackLines = await StackTrace.fromError(event.reason);
    }
    let data = `${event.reason.name}: ${event.reason.message}`;
    stackLines.forEach((stackLine) => {
      const { fileName, functionName, lineNumber, columnNumber } = stackLine;
      const resolvedFileName = window.objectUrls[fileName] || fileName;
      const resolvedFuncName = functionName || '(anonymous function)';
      let line;
      if (lineNumber && columnNumber) {
        let resolvedLineNumber = lineNumber;
        if (resolvedFileName === 'index.html') {
          resolvedLineNumber = lineNumber - htmlOffset;
        }
        line = `\n    at ${resolvedFuncName} (${resolvedFileName}:${resolvedLineNumber}:${columnNumber})`;
      } else {
        line = `\n    at ${resolvedFuncName} (${resolvedFileName})`;
      }
      data = data.concat(line);
    });
    editor.postMessage(
      {
        source: 'sketch',
        messages: [
          {
            log: [
              {
                method: 'error',
                data: [data],
                id: Date.now().toString()
              }
            ]
          }
        ]
      },
      editorOrigin
    );
  }
};

// Monkeypatch p5._friendlyError
const { _report } = window.p5;
if (_report) {
  window.p5._report = function resolvedReport(message, method, color) {
    const urls = Object.keys(window.objectUrls);
    const paths = Object.keys(window.objectPaths);
    let newMessage = message;
    urls.forEach((url) => {
      newMessage = newMessage.replaceAll(url, window.objectUrls[url]);
      if (newMessage.match('index.html')) {
        const onLineRegex = /on line (?<lineNo>.\d) in/gm;
        const lineNoRegex = /index\.html:(?<lineNo>.\d):/gm;
        const match = onLineRegex.exec(newMessage);
        const line = match.groups.lineNo;
        const resolvedLine = parseInt(line, 10) - htmlOffset;
        newMessage = newMessage.replace(
          onLineRegex,
          `on line ${resolvedLine} in`
        );
        newMessage = newMessage.replace(
          lineNoRegex,
          `index.html:${resolvedLine}:`
        );
      }
    });
    paths.forEach((path) => {
      newMessage = newMessage.replaceAll(path, window.objectPaths[path]);
    });
    _report.apply(window.p5, [newMessage, method, color]);
  };
}
