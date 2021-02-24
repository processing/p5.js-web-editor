// Inspired by
// https://github.com/codesandbox/codesandbox-client/blob/master/packages/codesandbox-api/src/dispatcher/index.ts

let frame = null;
let listener = null;
const { origin } = window;

export function registerFrame(newFrame) {
  frame = newFrame;
  return () => {
    frame = null;
  };
}

function notifyListener(message) {
  if (listener) listener(message);
}

function notifyFrame(message) {
  const rawMessage = JSON.parse(JSON.stringify(message));
  if (frame && frame.postMessage) {
    frame.postMessage(rawMessage, origin);
  }
}

export function dispatch(message) {
  if (!message) return;

  notifyListener(message);
  notifyFrame(message);
}

/**
 * Call callback to remove listener
 */
export function listen(callback) {
  listener = callback;
  return () => {
    listener = null;
  };
}

function eventListener(e) {
  const { data } = e;

  if (data && e.origin === origin) {
    notifyListener(data);
  }
}

window.addEventListener('message', eventListener);
