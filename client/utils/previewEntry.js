import loopProtect from 'loop-protect';
import { Hook, Decode, Encode } from 'console-feed';
import evaluateExpression from './evaluateExpression';
import { EXTERNAL_LINK_REGEX } from '../../server/utils/fileUtils';

// should postMessage user the dispatcher? does the parent window need to
// be registered as a frame? or a just a listener?

// could maybe send these as a message idk
// const { editor } = window;
const editor = window.parent.parent;
const { editorOrigin } = window;
// const editorOrigin = '*';
// const editorOrigin = 'http://localhost:8000';
// so this works??
// maybe i have to pass the parent window??? idk man

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

function getScriptOff(line) {
  const { offs } = window;
  let l = 0;
  let file = '';
  for (let i = 0; i < offs.length; i += 1) {
    const n = offs[i][0];
    if (n < line && n > l) {
      l = n;
      [, file] = offs[i];
    }
  }
  return [line - l, file];
}
// catch reference errors, via http://stackoverflow.com/a/12747364/2994108
window.onerror = function onError(msg, url, lineNumber, columnNo, error) {
  // var string = msg.toLowerCase();
  // var substring = "script error";
  let data = {};
  let fileInfo;
  if (url.match(EXTERNAL_LINK_REGEX) !== null && error.stack) {
    const errorNum = error.stack.split('about:srcdoc:')[1].split(':')[0];
    fileInfo = getScriptOff(errorNum);
    data = `${msg} (${fileInfo[1]}: line ${fileInfo[0]})`;
  } else {
    fileInfo = getScriptOff(lineNumber);
    data = `${msg} (${fileInfo[1]}: line ${fileInfo[0]})`;
  }
  editor.postMessage(
    {
      source: fileInfo[1],
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
window.onunhandledrejection = function onUnhandledRejection(event) {
  if (event.reason && event.reason.message && event.reason.stack) {
    const errorNum = event.reason.stack.split('about:srcdoc:')[1].split(':')[0];
    const fileInfo = getScriptOff(errorNum);
    const data = `${event.reason.message} (${fileInfo[1]}: line ${fileInfo[0]})`;
    editor.postMessage(
      {
        source: fileInfo[1],
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
