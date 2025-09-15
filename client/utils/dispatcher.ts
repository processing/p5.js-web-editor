// Inspired by
// https://github.com/codesandbox/codesandbox-client/blob/master/packages/codesandbox-api/src/dispatcher/index.ts

const frames: {
  [key: number]: { frame: Window | null; origin: string };
} = {};
let frameIndex = 1;

/* eslint-disable no-shadow */
/** Codesandbox dispatcher message types: */
export enum MessageTypes {
  START = 'START',
  STOP = 'STOP',
  FILES = 'FILES',
  SKETCH = 'SKETCH',
  REGISTER = 'REGISTER',
  EXECUTE = 'EXECUTE'
}
/* eslint-enable no-shadow */

/**
 * Codesandbox dispatcher message
 *   - type: 'START', 'STOP' etc
 *   - payload: additional data for that message type
 */
export interface Message {
  type: MessageTypes;
  payload?: any;
}

let listener: ((message: Message) => void) | null = null;

/**
 * Registers a frame to receive future dispatched messages.
 * @param newFrame - The Window object of the frame to register.
 * @param newOrigin - The expected origin to use when posting messages to this frame. If this is nullish, it will be registered as ''
 * @returns A cleanup function that unregisters the frame.
 */
export function registerFrame(
  newFrame: Window | null,
  newOrigin: string | null | undefined
): () => void {
  const frameId = frameIndex;
  frameIndex += 1;
  frames[frameId] = { frame: newFrame, origin: newOrigin ?? '' };
  return () => {
    delete frames[frameId];
  };
}

function notifyListener(message: Message): void {
  if (listener) listener(message);
}

function notifyFrames(message: Message) {
  const rawMessage = JSON.parse(JSON.stringify(message));
  Object.values(frames).forEach((frameObj) => {
    const { frame, origin } = frameObj;
    if (frame && frame.postMessage) {
      frame.postMessage(rawMessage, origin);
    }
  });
}

/**
 * Sends a message to all registered frames.
 * @param message - The message to dispatch.
 */
export function dispatchMessage(message: Message | undefined | null): void {
  if (!message) return;
  notifyFrames(message);
}

/**
 * Call callback to remove listener
 */
export function listen(callback: (message: Message) => void): () => void {
  listener = callback;
  return () => {
    listener = null;
  };
}

function eventListener(e: MessageEvent) {
  const { data } = e;
  if (data) {
    notifyListener(data);
  }
}

window.addEventListener('message', eventListener);
