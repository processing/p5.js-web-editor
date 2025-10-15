import React from 'react';
import { render } from '../test-utils';
import { useKeyDownHandlers } from './useKeyDownHandlers';
import { isMac } from '../utils/device';

jest.mock('../utils/device');

function fireKeyboardEvent(key: string, options: Partial<KeyboardEvent> = {}) {
  const event = new KeyboardEvent('keydown', {
    key,
    code: `Key${key.toUpperCase()}`,
    bubbles: true,
    cancelable: true,
    ...options
  });
  document.dispatchEvent(event);
}

// Component for testing the hook
const HookConsumer = ({
  handlers
}: {
  handlers: Record<string, jest.Mock>;
}) => {
  useKeyDownHandlers(handlers);
  return null;
};

describe('useKeyDownHandlers', () => {
  let handlers: Record<string, jest.Mock>;

  beforeEach(() => {
    handlers = {
      f: jest.fn(),
      'ctrl-f': jest.fn(),
      'ctrl-shift-f': jest.fn(),
      'ctrl-alt-n': jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls "ctrl-f" handler on Windows (isMac false)', () => {
    (isMac as jest.Mock).mockReturnValue(false);

    render(<HookConsumer handlers={handlers} />);
    fireKeyboardEvent('f', { ctrlKey: true });

    expect(handlers['ctrl-f']).toHaveBeenCalled();
    expect(handlers.f).toHaveBeenCalled();
  });

  it('calls "ctrl-f" handler on Mac (isMac true)', () => {
    (isMac as jest.Mock).mockReturnValue(true);

    render(<HookConsumer handlers={handlers} />);
    fireKeyboardEvent('f', { metaKey: true });

    expect(handlers['ctrl-f']).toHaveBeenCalled();
    expect(handlers.f).toHaveBeenCalled();
  });

  it('calls "ctrl-shift-f" handler with both ctrl and shift keys', () => {
    (isMac as jest.Mock).mockReturnValue(false);

    render(<HookConsumer handlers={handlers} />);
    fireKeyboardEvent('f', { ctrlKey: true, shiftKey: true });

    expect(handlers['ctrl-shift-f']).toHaveBeenCalled();
  });

  it('calls "ctrl-alt-n" handler with ctrl and alt', () => {
    (isMac as jest.Mock).mockReturnValue(false);

    render(<HookConsumer handlers={handlers} />);
    fireKeyboardEvent('n', { ctrlKey: true, altKey: true, code: 'KeyN' });

    expect(handlers['ctrl-alt-n']).toHaveBeenCalled();
  });
});
