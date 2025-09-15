import { mapKeys } from 'lodash';
import { useCallback, useEffect, useRef } from 'react';
import { isMac } from '../utils/device';

/** Function to call upon keydown */
export type KeydownHandler = (e: KeyboardEvent) => void;
/** An object mapping from keys like 'ctrl-s' or 'ctrl-shift-1' to handlers. */
export type KeydownHandlerMap = Record<string, KeydownHandler>;

/**
 * Attaches keydown handlers to the global document.
 * Handles Mac/PC switching of Ctrl to Cmd.
 * @param keyHandlers - an object which maps from the key to its event handler. The object keys are a combination of the key and prefixes `ctrl-` `shift-`
 * (ie. 'ctrl-f', 'ctrl-shift-f') and the values are the function to call when that specific key is pressed.
 */
export function useKeyDownHandlers(keyHandlers: KeydownHandlerMap) {
  /**
   * Instead of memoizing the handlers, use a ref and call the current
   * handler at the time of the event.
   */
  const handlers = useRef(keyHandlers);

  useEffect(() => {
    handlers.current = mapKeys(keyHandlers, (value, key) => key?.toLowerCase());
  }, [keyHandlers]);

  /**
   * Will call all matching handlers, starting with the most specific: 'ctrl-shift-f' => 'ctrl-f' => 'f'.
   * Can use e.stopPropagation() to prevent subsequent handlers.
   * @type {(function(KeyboardEvent): void)}
   */
  const handleEvent = useCallback((e) => {
    if (!e.key) return;
    const isCtrl = isMac() ? e.metaKey : e.ctrlKey;
    if (e.shiftKey && isCtrl) {
      handlers.current[
        `ctrl-shift-${
          /^\d+$/.test(e.code.at(-1)) ? e.code.at(-1) : e.key.toLowerCase()
        }`
      ]?.(e);
    } else if (isCtrl && e.altKey && e.code === 'KeyN') {
      // specifically for creating a new file
      handlers.current[`ctrl-alt-n`]?.(e);
    } else if (isCtrl) {
      handlers.current[`ctrl-${e.key.toLowerCase()}`]?.(e);
    }
    handlers.current[e.key?.toLowerCase()]?.(e);
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleEvent);

    return () => document.removeEventListener('keydown', handleEvent);
  }, [handleEvent]);
}
