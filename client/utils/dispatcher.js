// Inspired by
// https://github.com/codesandbox/codesandbox-client/blob/master/packages/codesandbox-api/src/dispatcher/index.ts

let frame = null;
let listener = null;
// const { origin } = window;
let origin = null;

export const MessageTypes = {
  START: 'START',
  STOP: 'STOP',
  FILES: 'FILES',
  REGISTER: 'REGISTER'
};

// could instead register multiple frames here
export function registerFrame(newFrame, newOrigin) {
  frame = newFrame;
  origin = newOrigin;
  return () => {
    frame = null;
    origin = null;
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

export function dispatchMessage(message) {
  if (!message) return;

  // notifyListener(message);
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

  // should also store origin of parent? idk
  // if (data && e.origin === origin) {
  if (data) {
    notifyListener(data);
  }
}

window.addEventListener('message', eventListener);
