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
window.onerror = function onError(msg, source, lineNumber, columnNo, error) {
  const urls = Object.keys(window.objectUrls);
  let data = '';
  urls.forEach((url) => {
    if (error.stack.match(url)) {
      data = error.stack.replaceAll(url, window.objectUrls[url]);
    }
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
  return false;
};
// catch rejected promises
window.onunhandledrejection = function onUnhandledRejection(event) {
  if (event.reason && event.reason.message && event.reason.stack) {
    const urls = Object.keys(window.objectUrls);
    let data = '';
    urls.forEach((url) => {
      if (event.reason.stack.match(url)) {
        data = event.reason.stack.replaceAll(url, window.objectUrls[url]);
      }
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
// const friendlyError = window.p5._friendlyError;
// window.p5._friendlyError = function (message, method, color) {
//   const urls = Object.keys(window.objectUrls);
//   const paths = Object.keys(window.objectPaths);
//   let newMessage = message;
//   urls.forEach((url) => {
//     newMessage = newMessage.replaceAll(url, window.objectUrls[url]);
//   });
//   paths.forEach((path) => {
//     newMessage = newMessage.replaceAll(path, window.objectPaths[path]);
//   });
//   friendlyError.apply(window.p5, [newMessage, method, color]);
// };
