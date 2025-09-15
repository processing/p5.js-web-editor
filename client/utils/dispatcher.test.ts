import {
  registerFrame,
  dispatchMessage,
  listen,
  MessageTypes
} from './dispatcher';

describe('dispatcher', () => {
  let mockFrame: Window;
  let origin: string;
  let removeFrame: () => void;

  beforeEach(() => {
    origin = 'https://example.com';
    mockFrame = ({ postMessage: jest.fn() } as unknown) as Window;
  });

  afterEach(() => {
    if (removeFrame) removeFrame();
    jest.clearAllMocks();
  });

  describe('registerFrame', () => {
    it('registers and removes a frame', () => {
      removeFrame = registerFrame(mockFrame, origin);

      // Should send message to this frame
      dispatchMessage({ type: MessageTypes.START });

      expect(mockFrame.postMessage).toHaveBeenCalledWith(
        { type: MessageTypes.START },
        origin
      );

      // Remove and test no longer receives messages
      removeFrame();
      dispatchMessage({ type: MessageTypes.STOP });

      expect(mockFrame.postMessage).toHaveBeenCalledTimes(1); // still only one call
    });
  });

  describe('dispatchMessage', () => {
    it('does nothing if message is falsy', () => {
      expect(() => dispatchMessage(null)).not.toThrow();
      expect(() => dispatchMessage(undefined)).not.toThrow();
    });

    it('sends a deep-copied message to all registered frames', () => {
      const frame1 = ({ postMessage: jest.fn() } as unknown) as Window;
      const frame2 = ({ postMessage: jest.fn() } as unknown) as Window;

      const remove1 = registerFrame(frame1, origin);
      const remove2 = registerFrame(frame2, origin);

      const msg = { type: MessageTypes.EXECUTE, payload: { a: 1 } };
      dispatchMessage(msg);

      expect(frame1.postMessage).toHaveBeenCalledWith(msg, origin);
      expect(frame2.postMessage).toHaveBeenCalledWith(msg, origin);

      remove1();
      remove2();
    });
  });

  describe('listen', () => {
    it('sets a listener that gets called when message is posted to window', () => {
      const callback = jest.fn();
      const removeListener = listen(callback);

      const fakeEvent = new MessageEvent('message', {
        data: { type: MessageTypes.SKETCH }
      });

      window.dispatchEvent(fakeEvent);

      expect(callback).toHaveBeenCalledWith({ type: MessageTypes.SKETCH });

      removeListener();

      // Dispatch again to verify it's removed
      window.dispatchEvent(
        new MessageEvent('message', {
          data: { type: MessageTypes.STOP }
        })
      );

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
});
